import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { captureError } from '@repo/error/node'
import { Type } from '@sinclair/typebox'
import { and, eq, gt } from 'drizzle-orm'
import type { FastifyBaseLogger, FastifyInstance, FastifyPluginAsync, FastifyReply } from 'fastify'
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

function signSessionTokens({
  fastify,
  userId,
  sessionId,
  refreshJti,
  wallet,
}: {
  fastify: FastifyInstance
  userId: string
  sessionId: string
  refreshJti: string
  wallet?: { chain: string; address: string }
}) {
  const accessPayload = createAccessTokenPayload({ userId, sessionId, wallet })
  const refreshPayload = createRefreshTokenPayload({ userId, sessionId, jti: refreshJti })
  return {
    token: fastify.jwt.sign(accessPayload, {
      expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
    }),
    refreshToken: fastify.jwt.sign(refreshPayload, {
      expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
    }),
  }
}

function sessionWallet(session: { walletChain: string | null; walletAddress: string | null }) {
  return session.walletChain && session.walletAddress
    ? { chain: session.walletChain, address: session.walletAddress }
    : undefined
}

function isWithinReuseGrace({ rotatedAt, now }: { rotatedAt: Date | null; now: Date }) {
  if (!rotatedAt) return false
  return now.getTime() - rotatedAt.getTime() < env.REFRESH_REUSE_GRACE_SECONDS * 1000
}

async function sendReuseDetected({
  reply,
  requestUrl,
  logger,
  sessionId,
  userId,
}: {
  reply: FastifyReply
  requestUrl: string
  logger: FastifyBaseLogger
  sessionId: string
  userId: string
}) {
  const db = await getDb()
  await db.delete(sessions).where(eq(sessions.id, sessionId))
  captureError({
    code: 'SECURITY_VIOLATION',
    error: new Error('Refresh token reuse detected'),
    logger,
    label: 'refresh token reuse detected',
    data: { sessionId, userId },
    tags: {
      app: 'api',
      module: 'auth-service',
      route: requestUrl,
      security: 'token-reuse',
    },
  })
  return sendCatalogError({ reply, status: 401, code: 'TOKEN_REUSE_DETECTED' })
}

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
          previousToken: jtiHash,
          currentJti: newRefreshJti,
          rotatedAt: now,
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
        const tokens = signSessionTokens({
          fastify,
          userId: decoded.sub,
          sessionId: decoded.sid,
          refreshJti: newRefreshJti,
          wallet: sessionWallet(rotated),
        })
        return reply.code(200).send(tokens)
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

      if (
        session.previousToken === jtiHash &&
        session.currentJti &&
        isWithinReuseGrace({ rotatedAt: session.rotatedAt, now })
      ) {
        const tokens = signSessionTokens({
          fastify,
          userId: decoded.sub,
          sessionId: decoded.sid,
          refreshJti: session.currentJti,
          wallet: sessionWallet(session),
        })
        return reply.code(200).send(tokens)
      }

      return sendReuseDetected({
        reply,
        requestUrl: request.url,
        logger: request.log,
        sessionId: decoded.sid,
        userId: decoded.sub,
      })
    },
  )
}

export default sessionRefreshRoute
export const prefixOverride = '/auth/session'
