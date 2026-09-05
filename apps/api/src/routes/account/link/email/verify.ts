import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { sessions, users, verification } from '../../../../db/schema/index.js'
import { logAuthVerifyFailed } from '../../../../lib/auth/signals.js'
import { normalizeEmail } from '../../../../lib/email.js'
import { findUserByNormalizedEmail } from '../../../../lib/email-identity.js'
import { env } from '../../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const VerifySchema = Type.Object({
  token: Type.String(),
})

const VerifyResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const linkEmailVerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'accountLinkEmailVerify',
        description: 'Verify link email token and update user email',
        summary: 'Link email verify',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: VerifySchema,
        response: {
          200: VerifyResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Session expired or not authenticated',
        })

      const { token } = request.body
      const tokenHash = hashToken(token)

      const db = await getDb()

      const [verificationRecord] = await db
        .select()
        .from(verification)
        .where(and(eq(verification.value, tokenHash), eq(verification.type, 'link_email')))

      if (!verificationRecord) {
        logAuthVerifyFailed({ request, code: 'INVALID_TOKEN', signInMethod: 'link_email' })
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        })
      }

      if (verificationRecord.expiresAt < new Date()) {
        await db.delete(verification).where(eq(verification.id, verificationRecord.id))
        logAuthVerifyFailed({ request, code: 'EXPIRED_TOKEN', signInMethod: 'link_email' })
        return reply.code(401).send({
          code: 'EXPIRED_TOKEN',
          message: 'Token has expired',
        })
      }

      const parts = verificationRecord.identifier.split(':')
      const userId = parts[0]
      const email = parts.slice(1).join(':')
      if (!userId || !email || userId !== request.session.user.id) {
        logAuthVerifyFailed({ request, code: 'INVALID_TOKEN', signInMethod: 'link_email' })
        return reply.code(401).send({
          code: 'INVALID_TOKEN',
          message: 'Token does not match current session',
        })
      }

      const { user: existingByEmail } = await findUserByNormalizedEmail({ db, email })
      if (existingByEmail && existingByEmail.id !== userId)
        return reply.code(409).send({
          code: 'EMAIL_ALREADY_IN_USE',
          message: 'This email is already used by another account',
        })

      const sessionId = request.session.session.id
      const refreshJti = generateJti()
      const refreshJtiHash = hashToken(refreshJti)
      const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

      const emailUpdate = await db.transaction(async tx => {
        await tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).for('update')

        await tx.delete(verification).where(eq(verification.id, verificationRecord.id))

        const [updated] = await tx
          .update(users)
          .set({ email: normalizeEmail(email), emailVerified: true, updatedAt: new Date() })
          .where(and(eq(users.id, userId), isNull(users.email)))
          .returning()

        if (!updated) return 'EMAIL_ALREADY_SET' as const

        await tx
          .update(sessions)
          .set({
            token: refreshJtiHash,
            currentJti: refreshJti,
            rotatedAt: new Date(),
            expiresAt: sessionExpiresAt,
          })
          .where(eq(sessions.id, sessionId))

        return 'ok' as const
      })

      if (emailUpdate === 'EMAIL_ALREADY_SET')
        return reply.code(409).send({
          code: 'EMAIL_ALREADY_SET',
          message: 'Account already has a primary email. Use change email instead.',
        })

      const accessPayload = createAccessTokenPayload({
        userId,
        sessionId,
      })
      const refreshPayload = createRefreshTokenPayload({
        userId,
        sessionId,
        jti: refreshJti,
      })

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

export default linkEmailVerifyRoute
export const prefixOverride = '/account/link/email'
