import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import EmailChangedNotification from '@repo/email/emails/email-changed-notification'
import { render } from '@repo/email/render'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { authAttempts, sessions, users, verification } from '../../../../db/schema/index.js'
import { recordAuthFailedAttempt } from '../../../../lib/auth-attempts.js'
import { normalizeEmail } from '../../../../lib/email.js'
import { env } from '../../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashLoginCode,
  hashToken,
} from '../../../../lib/jwt.js'
import { getTrustedClientIp } from '../../../../lib/request.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const changeEmailMaxAttempts = 5
const changeEmailLockMinutes = 15

const recordChangeEmailFailedAttempt = (db: Awaited<ReturnType<typeof getDb>>, ip: string) =>
  recordAuthFailedAttempt({
    db,
    ip,
    type: 'change_email',
    maxAttempts: changeEmailMaxAttempts,
    lockMinutes: changeEmailLockMinutes,
  })

const VerifySchema = Type.Object({
  token: Type.String({ pattern: '^\\d{6}$', description: '6-digit code' }),
  email: Type.Optional(
    Type.String({ format: 'email', description: 'For code entry (must match request)' }),
  ),
  verificationId: Type.Optional(Type.String({ format: 'uuid', description: 'For link click' })),
})

const VerifyResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

function discriminate(body: {
  token?: string
  email?: string
  verificationId?: string
}): 'code' | 'link' | 'invalid' {
  const hasEmail = Boolean(body.email)
  const hasVerificationId = Boolean(body.verificationId)
  if (hasEmail && !hasVerificationId) return 'code'
  if (hasVerificationId && !hasEmail) return 'link'
  return 'invalid'
}

const changeEmailVerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'accountEmailChangeVerify',
        description: 'Verify change email token (6-digit code) and update user email',
        summary: 'Change email verify',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: VerifySchema,
        response: {
          200: VerifyResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          429: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const body = request.body
      const mode = discriminate(body)
      if (mode === 'invalid')
        return reply.code(400).send({
          code: 'INVALID_PAYLOAD',
          message: 'Provide exactly one of { token, email } or { token, verificationId }',
        })

      const token = body.token
      const tokenHash = hashLoginCode(token)
      const db = await getDb()
      const ip = getTrustedClientIp(request)
      const userId = request.session.user.id

      const [attemptRow] = await db
        .select()
        .from(authAttempts)
        .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, 'change_email')))

      if (attemptRow?.lockedUntil && attemptRow.lockedUntil > new Date())
        return reply.code(429).send({
          code: 'TOO_MANY_ATTEMPTS',
          message: 'Too many failed attempts. Try again later.',
        })

      let verificationWhere: ReturnType<typeof and>
      if (mode === 'link' && body.verificationId)
        verificationWhere = and(
          eq(verification.id, body.verificationId),
          eq(verification.value, tokenHash),
          eq(verification.type, 'change_email'),
        )
      else if (mode === 'code' && body.email)
        verificationWhere = and(
          eq(verification.identifier, `${userId}:${normalizeEmail(body.email)}`),
          eq(verification.value, tokenHash),
          eq(verification.type, 'change_email'),
        )
      else
        return reply.code(400).send({
          code: 'INVALID_PAYLOAD',
          message: 'Provide exactly one of { token, email } or { token, verificationId }',
        })

      const [verificationRecord] = await db.select().from(verification).where(verificationWhere)

      if (!verificationRecord) {
        await recordChangeEmailFailedAttempt(db, ip)
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        })
      }

      if (verificationRecord.expiresAt < new Date()) {
        await db.delete(verification).where(eq(verification.id, verificationRecord.id))
        await recordChangeEmailFailedAttempt(db, ip)
        return reply.code(401).send({
          code: 'EXPIRED_TOKEN',
          message: 'Token has expired',
        })
      }

      const parts = verificationRecord.identifier.split(':')
      const targetUserId = parts[0]
      const newEmail = parts.slice(1).join(':')
      if (targetUserId !== userId)
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Token does not match current session',
        })

      const [userRow] = await db.select().from(users).where(eq(users.id, userId))
      const oldEmail = userRow?.email ?? null

      const sessionId = request.session.session.id
      const refreshJti = generateJti()
      const refreshJtiHash = hashToken(refreshJti)
      const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

      await db.transaction(async tx => {
        await tx.delete(verification).where(eq(verification.id, verificationRecord.id))
        await tx
          .update(users)
          .set({ email: newEmail, emailVerified: true, updatedAt: new Date() })
          .where(eq(users.id, userId))
        await tx
          .update(sessions)
          .set({ token: refreshJtiHash, expiresAt: sessionExpiresAt })
          .where(eq(sessions.id, sessionId))
      })

      await db
        .delete(authAttempts)
        .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, 'change_email')))

      if (oldEmail && oldEmail !== newEmail) {
        const html = await render(
          EmailChangedNotification({ newEmail, fullName: userRow?.name ?? undefined }),
        )
        fastify.emailProvider.emails
          .send({
            from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
            to: oldEmail,
            subject: `Your email was changed - ${env.APP_NAME}`,
            html,
          })
          .catch(err => fastify.log.warn({ err }, 'Failed to send email-changed notification'))
      }

      const accessPayload = createAccessTokenPayload({ userId, sessionId })
      const refreshPayload = createRefreshTokenPayload({ userId, sessionId, jti: refreshJti })

      const accessToken = fastify.jwt.sign(accessPayload, {
        expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
      })
      const refreshToken = fastify.jwt.sign(refreshPayload, {
        expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
      })

      return reply.code(200).send({ token: accessToken, refreshToken })
    },
  )
}

export default changeEmailVerifyRoute
export const prefixOverride = '/account/email/change'
