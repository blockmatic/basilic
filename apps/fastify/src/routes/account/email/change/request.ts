import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import ChangeEmailEmail from '@repo/email/emails/change-email'
import { render } from '@repo/email/render'
import { Type } from '@sinclair/typebox'
import { and, eq, gte, like, sql } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { users, verification } from '../../../../db/schema/index.js'
import { normalizeEmail } from '../../../../lib/email.js'
import { env } from '../../../../lib/env.js'
import { generateLoginCode, hashToken } from '../../../../lib/jwt.js'
import { isAllowedUrl } from '../../../../lib/url.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const changeEmailRequestPerUserPerHour = 3

const RequestSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  callbackUrl: Type.String({ format: 'uri' }),
})

const RequestResponseSchema = Type.Object({
  ok: Type.Boolean(),
})

const changeEmailRequestRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/request',
    {
      schema: {
        operationId: 'accountEmailChangeRequest',
        description: 'Request change of email for authenticated user',
        summary: 'Change email request',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: RequestSchema,
        response: {
          200: RequestResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
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

      const { email, callbackUrl } = request.body
      const normalizedEmail = normalizeEmail(email)

      if (!isAllowedUrl(callbackUrl))
        return reply.code(400).send({
          code: 'INVALID_INPUT',
          message: 'Invalid or unsafe callback URL',
        })

      const db = await getDb()
      const userId = request.session.user.id

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const [recentCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(verification)
        .where(
          and(
            eq(verification.type, 'change_email'),
            like(verification.identifier, `${userId}:%`),
            gte(verification.createdAt, oneHourAgo),
          ),
        )
      if ((recentCount?.count ?? 0) >= changeEmailRequestPerUserPerHour)
        return reply.code(429).send({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many change-email requests. Try again later.',
        })

      const [existingByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
      if (existingByEmail && existingByEmail.id === userId)
        return reply.code(400).send({
          code: 'EMAIL_NOT_CHANGED',
          message: 'New email is the same as current email',
        })
      if (existingByEmail && existingByEmail.id !== userId)
        return reply.code(409).send({
          code: 'EMAIL_ALREADY_IN_USE',
          message: 'This email is already used by another account',
        })

      const code = generateLoginCode()
      const tokenHash = hashToken(code)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      const verificationId = randomUUID()
      const identifier = `${userId}:${normalizedEmail}`

      const storePlain =
        env.NODE_ENV !== 'production' &&
        env.ALLOW_TEST === true &&
        typeof normalizedEmail === 'string' &&
        normalizedEmail.endsWith('@test.ai')

      await db.insert(verification).values({
        id: verificationId,
        type: 'change_email',
        identifier,
        value: tokenHash,
        ...(storePlain && { tokenPlain: code }),
        expiresAt,
      })

      try {
        const changeEmailUrl = new URL(callbackUrl)
        changeEmailUrl.searchParams.set('token', code)
        changeEmailUrl.searchParams.set('verificationId', verificationId)

        const html = await render(
          ChangeEmailEmail({
            changeEmailLink: changeEmailUrl.toString(),
            loginCode: code,
            expirationMinutes: 15,
          }),
        )
        const emailResponse = await fastify.emailProvider.emails.send({
          from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
          to: normalizedEmail,
          subject: `Update your email - ${env.APP_NAME}`,
          html,
        })

        if ('error' in emailResponse && emailResponse.error)
          throw new Error(
            `Failed to send email: ${emailResponse.error.message || JSON.stringify(emailResponse.error)}`,
          )

        return reply.code(200).send({ ok: true })
      } catch (err) {
        await db
          .delete(verification)
          .where(
            and(
              eq(verification.id, verificationId),
              eq(verification.type, 'change_email'),
              eq(verification.identifier, identifier),
            ),
          )
        throw err
      }
    },
  )
}

export default changeEmailRequestRoute
export const prefixOverride = '/account/email/change'
