import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { captureError } from '@repo/error/node'
import { Type } from '@sinclair/typebox'
import { and, eq, gt } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { env } from '../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../schemas.js'

const RefreshSchema = Type.Object({
  refreshToken: Type.String({ minLength: 1 }),
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

      let decoded: {
        typ?: string
        sub?: string
        sid?: string
        jti?: string
      }
      try {
        decoded = fastify.jwt.verify<typeof decoded>(refreshTokenInput)
      } catch {
        return sendCatalogError({ reply, status: 401, code: 'INVALID_TOKEN' })
      }

      if (decoded.typ !== 'refresh' || !decoded.sub || !decoded.sid || !decoded.jti)
        return sendCatalogError({ reply, status: 401, code: 'INVALID_TOKEN' })

      const db = await getDb()
      const now = new Date()
      const jtiHash = hashToken(decoded.jti)
      const newRefreshJti = generateJti()
      const newRefreshJtiHash = hashToken(newRefreshJti)
      const newSessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

      const [rotated] = await db
        .update(sessions)
        .set({
          token: newRefreshJtiHash,
          expiresAt: newSessionExpiresAt,
        })
        .where(
          and(
            eq(sessions.id, decoded.sid),
            eq(sessions.token, jtiHash),
            eq(sessions.userId, decoded.sub),
            gt(sessions.expiresAt, now),
          ),
        )
        .returning()

      if (rotated) {
        const wallet =
          rotated.walletChain && rotated.walletAddress
            ? { chain: rotated.walletChain, address: rotated.walletAddress }
            : undefined

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
      }

      const [session] = await db.select().from(sessions).where(eq(sessions.id, decoded.sid))

      if (!session) return sendCatalogError({ reply, status: 401, code: 'SESSION_NOT_FOUND' })

      if (session.expiresAt < now) {
        await db.delete(sessions).where(eq(sessions.id, session.id))
        return sendCatalogError({ reply, status: 401, code: 'EXPIRED_TOKEN' })
      }

      if (session.userId !== decoded.sub) {
        await db.delete(sessions).where(eq(sessions.id, session.id))
        return sendCatalogError({ reply, status: 401, code: 'INVALID_TOKEN' })
      }

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

      return sendCatalogError({ reply, status: 401, code: 'TOKEN_REUSE_DETECTED' })
    },
  )
}

export default sessionRefreshRoute
export const prefixOverride = '/auth/session'
