import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { captureError } from '@repo/sentry/node'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { env } from '../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../schemas.js'

const RefreshSchema = Type.Object({
  refreshToken: Type.String(),
})

const RefreshResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const sessionRefreshRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/refresh',
    {
      schema: {
        operationId: 'refresh',
        description: 'Refresh access token',
        summary: 'Refresh token',
        tags: ['auth'],
        security: [],
        body: RefreshSchema,
        response: {
          200: RefreshResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { refreshToken: refreshTokenInput } = request.body

      if (!refreshTokenInput) {
        return reply.code(400).send({
          code: 'MISSING_TOKEN',
          message: 'Refresh token is required',
        })
      }

      // Verify refresh JWT
      let decoded: {
        typ?: string
        sub?: string
        sid?: string
        jti?: string
      }
      try {
        decoded = fastify.jwt.verify<typeof decoded>(refreshTokenInput)
      } catch {
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        })
      }

      // Validate token type
      if (decoded.typ !== 'refresh' || !decoded.sub || !decoded.sid || !decoded.jti) {
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        })
      }

      const db = await getDb()

      // Load session
      const [session] = await db.select().from(sessions).where(eq(sessions.id, decoded.sid))

      if (!session) {
        return reply.code(401).send({
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Check expiration
      if (session.expiresAt < new Date()) {
        // Clean up expired session
        await db.delete(sessions).where(eq(sessions.id, session.id))
        return reply.code(401).send({
          code: 'EXPIRED_TOKEN',
          message: 'Refresh token has expired',
        })
      }

      // Verify jti hash matches (reuse detection)
      const jtiHash = hashToken(decoded.jti)
      if (session.token !== jtiHash) {
        // Token reuse detected - revoke session
        await db.delete(sessions).where(eq(sessions.id, session.id))

        captureError({
          code: 'SECURITY_VIOLATION',
          error: new Error('Refresh token reuse detected'),
          logger: request.log,
          label: 'refresh token reuse detected',
          data: {
            sessionId: decoded.sid,
            userId: decoded.sub,
          },
          tags: {
            app: 'api',
            module: 'auth-service',
            route: request.url,
            security: 'token-reuse',
          },
        })

        return reply.code(401).send({
          code: 'TOKEN_REUSE_DETECTED',
          message: 'Token reuse detected - session revoked',
        })
      }

      // Rotate refresh token
      const newRefreshJti = generateJti()
      const newRefreshJtiHash = hashToken(newRefreshJti)
      const newSessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

      await db
        .update(sessions)
        .set({
          token: newRefreshJtiHash,
          expiresAt: newSessionExpiresAt,
        })
        .where(eq(sessions.id, session.id))

      const wallet =
        session.walletChain && session.walletAddress
          ? { chain: session.walletChain, address: session.walletAddress }
          : undefined

      // Issue new JWTs
      const accessPayload = createAccessTokenPayload({
        userId: decoded.sub,
        sessionId: decoded.sid,
        wallet,
      })
      const refreshPayload = createRefreshTokenPayload({
        userId: decoded.sub,
        sessionId: decoded.sid,
        jti: newRefreshJti,
      })

      const accessToken = fastify.jwt.sign(accessPayload, {
        expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
      })
      const newRefreshToken = fastify.jwt.sign(refreshPayload, {
        expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
      })

      return reply.code(200).send({
        token: accessToken,
        refreshToken: newRefreshToken,
      })
    },
  )
}

export default sessionRefreshRoute
export const prefixOverride = '/auth/session'
