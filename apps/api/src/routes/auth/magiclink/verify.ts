import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, sql } from 'drizzle-orm'
import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'
import { getDb } from '../../../db/index.js'
import { authAttempts, users, verification } from '../../../db/schema/index.js'
import { hashToken } from '../../../lib/jwt.js'
import { getTrustedClientIp } from '../../../lib/request.js'
import { createSessionAndIssueTokens } from '../../../lib/session.js'
import { ErrorResponseSchema } from '../../schemas.js'

const magicLinkMaxAttempts = 5
const magicLinkLockMinutes = 15

/** Verify magic link token and return access JWT. Used by reference route callback and POST /verify. */
export async function verifyMagicLinkAndIssueToken(
  fastify: FastifyInstance,
  request: FastifyRequest,
  { token, verificationId }: { token: string; verificationId: string },
): Promise<{ accessToken: string } | null> {
  const tokenHash = hashToken(token)
  const db = await getDb()
  const ip = getTrustedClientIp(request)

  const [attemptRow] = await db
    .select()
    .from(authAttempts)
    .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, 'magic_link')))

  if (attemptRow?.lockedUntil && attemptRow.lockedUntil > new Date()) return null

  const [verificationRecord] = await db
    .select()
    .from(verification)
    .where(
      and(
        eq(verification.id, verificationId),
        eq(verification.value, tokenHash),
        eq(verification.type, 'magic_link'),
      ),
    )

  async function recordFailedAttempt() {
    const now = new Date()
    const lockedUntilNew = new Date(now.getTime() + magicLinkLockMinutes * 60 * 1000)
    await db
      .insert(authAttempts)
      .values({
        id: randomUUID(),
        key: ip,
        type: 'magic_link',
        failedAttempts: 1,
        firstFailureAt: now,
        lockedUntil: null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [authAttempts.key, authAttempts.type],
        set: {
          failedAttempts: sql`${authAttempts.failedAttempts} + 1`,
          firstFailureAt: sql`COALESCE(${authAttempts.firstFailureAt}, ${now})`,
          lockedUntil: sql`CASE WHEN (${authAttempts.failedAttempts} + 1) >= ${magicLinkMaxAttempts} THEN ${lockedUntilNew}::timestamptz ELSE NULL END`,
          updatedAt: now,
        },
      })
  }

  if (!verificationRecord) {
    await recordFailedAttempt()
    return null
  }

  if (verificationRecord.expiresAt < new Date()) {
    await db.delete(verification).where(eq(verification.id, verificationRecord.id))
    await recordFailedAttempt()
    return null
  }

  const [user] = await db.select().from(users).where(eq(users.email, verificationRecord.identifier))

  if (!user) return null

  await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, user.id))

  await db
    .delete(authAttempts)
    .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, 'magic_link')))
  await db.delete(verification).where(eq(verification.id, verificationRecord.id))

  const { accessToken } = await createSessionAndIssueTokens({ fastify, db, userId: user.id })
  return { accessToken }
}

const VerifySchema = Type.Object({
  token: Type.String({ pattern: '^\\d{6}$', description: '6-digit code' }),
  verificationId: Type.Optional(
    Type.String({ format: 'uuid', description: 'Verification row id (from magic link URL)' }),
  ),
  email: Type.Optional(
    Type.String({ format: 'email', description: 'Email (for code entry on login page)' }),
  ),
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
      const { token, verificationId, email } = request.body
      const hasVerificationId = Boolean(verificationId)
      const hasEmail = Boolean(email)
      if (hasVerificationId === hasEmail)
        return reply.code(400).send({
          code: 'INVALID_INPUT',
          message: 'Provide exactly one of verificationId (from link) or email (for code entry)',
        })

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

      const idOrEmail = (hasVerificationId ? verificationId : email) ?? ''
      const verificationWhere = hasVerificationId
        ? and(
            eq(verification.id, idOrEmail),
            eq(verification.value, tokenHash),
            eq(verification.type, 'magic_link'),
          )
        : and(
            eq(verification.identifier, idOrEmail),
            eq(verification.value, tokenHash),
            eq(verification.type, 'magic_link'),
          )
      const [verificationRecord] = await db.select().from(verification).where(verificationWhere)

      async function recordFailedAttempt() {
        const now = new Date()
        const lockedUntilNew = new Date(now.getTime() + magicLinkLockMinutes * 60 * 1000)
        await db
          .insert(authAttempts)
          .values({
            id: randomUUID(),
            key: ip,
            type: 'magic_link',
            failedAttempts: 1,
            firstFailureAt: now,
            lockedUntil: null,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [authAttempts.key, authAttempts.type],
            set: {
              failedAttempts: sql`${authAttempts.failedAttempts} + 1`,
              firstFailureAt: sql`COALESCE(${authAttempts.firstFailureAt}, ${now})`,
              lockedUntil: sql`CASE WHEN (${authAttempts.failedAttempts} + 1) >= ${magicLinkMaxAttempts} THEN ${lockedUntilNew}::timestamptz ELSE NULL END`,
              updatedAt: now,
            },
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

      await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, user.id))

      await db
        .delete(authAttempts)
        .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, 'magic_link')))

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
