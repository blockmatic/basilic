import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import LinkEmailEmail from '@repo/email/emails/link-email'
import { render } from '@repo/email/render'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { users, verification } from '../../../../db/schema/index.js'
import { sendServerCatalogError } from '../../../../lib/catalogs/mapper.js'
import { sendMail } from '../../../../lib/email.js'
import { findUserByNormalizedEmail } from '../../../../lib/email-identity.js'
import { env } from '../../../../lib/env.js'
import { generateToken, hashToken } from '../../../../lib/jwt.js'
import { isAllowedUrl } from '../../../../lib/url.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const RequestSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  callbackUrl: Type.String({ format: 'uri' }),
})

const RequestResponseSchema = Type.Object({
  ok: Type.Boolean(),
})

const linkEmailRequestRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/request',
    {
      schema: {
        operationId: 'accountLinkEmailRequest',
        description: 'Request email to link to authenticated user',
        summary: 'Link email request',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: RequestSchema,
        response: {
          200: RequestResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
          500: ErrorResponseSchema,
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

      if (!isAllowedUrl(callbackUrl))
        return reply.code(400).send({
          code: 'INVALID_INPUT',
          message: 'Invalid or unsafe callback URL',
        })

      const db = await getDb()

      const [currentUser] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, request.session.user.id))

      if (currentUser?.email)
        return reply.code(409).send({
          code: 'EMAIL_ALREADY_SET',
          message: 'Account already has a primary email. Use change email instead.',
        })

      const lookup = await findUserByNormalizedEmail({ db, email })
      if (lookup.status === 'collision')
        return sendServerCatalogError({ request, reply, code: 'UNEXPECTED_ERROR' })
      const { user: existingUser, normalized } = lookup
      if (existingUser && existingUser.id !== request.session.user.id)
        return reply.code(409).send({
          code: 'EMAIL_ALREADY_IN_USE',
          message: 'This email is already used by another account',
        })

      const token = generateToken()
      const tokenHash = hashToken(token)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      const verificationId = randomUUID()

      const storePlain =
        env.NODE_ENV !== 'production' && env.ALLOW_TEST === true && normalized.endsWith('@test.ai')

      await db.insert(verification).values({
        id: verificationId,
        type: 'link_email',
        identifier: `${request.session.user.id}:${normalized}`,
        value: tokenHash,
        ...(storePlain && { tokenPlain: token }),
        expiresAt,
      })

      const linkUrl = new URL(callbackUrl)
      linkUrl.searchParams.set('token', token)

      const html = await render(
        LinkEmailEmail({ linkUrl: linkUrl.toString(), expirationMinutes: 15 }),
      )

      try {
        await sendMail({
          provider: fastify.emailProvider,
          logger: request.log,
          mode: 'throw',
          message: {
            from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
            to: normalized,
            subject: 'Link your email',
            html,
          },
        })
      } catch (err) {
        await db.delete(verification).where(eq(verification.id, verificationId))
        throw err
      }

      return reply.code(200).send({ ok: true })
    },
  )
}

export default linkEmailRequestRoute
export const prefixOverride = '/account/link/email'
