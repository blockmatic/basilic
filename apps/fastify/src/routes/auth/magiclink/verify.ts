import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { authAttempts, users, verification } from '../../../db/schema/index.js'
import { hashToken } from '../../../lib/jwt.js'
import { getTrustedClientIp } from '../../../lib/request.js'
import { createSessionAndIssueTokens } from '../../../lib/session.js'
import { ErrorResponseSchema } from '../../schemas.js'

const magicLinkMaxAttempts = 5
const magicLinkLockMinutes = 15

const VerifySchema = Type.Object({
  token: Type.String({ pattern: '^\\d{6}$', description: '6-digit code' }),
})

const VerifyResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const magicLinkVerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'magiclinkVerify',
        description: 'Verify magic link token and return JWTs',
        summary: 'Verify magic link',
        tags: ['auth'],
        security: [],
        body: VerifySchema,
        response: {
          200: VerifyResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          429: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { token } = request.body
      const tokenHash = hashToken(token)

      const db = await getDb()
      const ip = getTrustedClientIp(request)

      const [attemptRow] = await db
        .select()
        .from(authAttempts)
        .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, 'magic_link')))

      if (attemptRow?.lockedUntil && attemptRow.lockedUntil > new Date())
        return reply.code(429).send({
          code: 'TOO_MANY_ATTEMPTS',
          message: 'Too many failed attempts. Try again later.',
        })

      const [verificationRecord] = await db
        .select()
        .from(verification)
        .where(and(eq(verification.value, tokenHash), eq(verification.type, 'magic_link')))

      async function recordFailedAttempt() {
        const now = new Date()
        const failedAttempts = (attemptRow?.failedAttempts ?? 0) + 1
        const lockedUntil =
          failedAttempts >= magicLinkMaxAttempts
            ? new Date(now.getTime() + magicLinkLockMinutes * 60 * 1000)
            : null

        if (attemptRow)
          await db
            .update(authAttempts)
            .set({
              failedAttempts,
              firstFailureAt: attemptRow.firstFailureAt ?? now,
              lockedUntil,
              updatedAt: now,
            })
            .where(eq(authAttempts.id, attemptRow.id))
        else
          await db.insert(authAttempts).values({
            id: randomUUID(),
            key: ip,
            type: 'magic_link',
            failedAttempts,
            firstFailureAt: now,
            lockedUntil,
          })
      }

      if (!verificationRecord) {
        await recordFailedAttempt()
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        })
      }

      if (verificationRecord.expiresAt < new Date()) {
        await db.delete(verification).where(eq(verification.id, verificationRecord.id))
        await recordFailedAttempt()
        return reply.code(401).send({
          code: 'EXPIRED_TOKEN',
          message: 'Token has expired',
        })
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, verificationRecord.identifier))

      if (!user)
        return reply.code(404).send({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        })

      if (attemptRow) await db.delete(authAttempts).where(eq(authAttempts.id, attemptRow.id))

      await db.delete(verification).where(eq(verification.id, verificationRecord.id))

      const { accessToken, refreshToken } = await createSessionAndIssueTokens({
        fastify,
        db,
        userId: user.id,
      })

      return reply.code(200).send({
        token: accessToken,
        refreshToken,
      })
    },
  )
}

export default magicLinkVerifyRoute
export const prefixOverride = '/auth/magiclink'
