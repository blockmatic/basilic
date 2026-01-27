import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import MagicLinkLoginEmail from '@repo/email/emails/magic-link-login'
import { render } from '@repo/email/render'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { users, verification } from '../../../db/schema/index.js'
import { env } from '../../../lib/env.js'
import { generateToken, hashToken } from '../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../schemas.js'
import { validateCallbackUrl } from '../utils.js'

const RequestSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  callbackUrl: Type.String({ format: 'uri' }),
})

const RequestResponseSchema = Type.Object({
  ok: Type.Boolean(),
})

const magicLinkRequestRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/request',
    {
      schema: {
        operationId: 'magiclinkRequest',
        description: 'Request magic link for authentication',
        summary: 'Request magic link',
        tags: ['auth'],
        security: [],
        body: RequestSchema,
        response: {
          200: RequestResponseSchema,
          400: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, callbackUrl } = request.body

      // Validate callback URL
      if (!validateCallbackUrl(callbackUrl)) {
        return reply.status(400).send({
          code: 'INVALID_INPUT',
          message: 'Invalid or unsafe callback URL',
        })
      }

      const db = await getDb()

      // Find or create user
      let [user] = await db.select().from(users).where(eq(users.email, email))
      if (!user) {
        const userId = randomUUID()
        await db.insert(users).values({
          id: userId,
          email,
          emailVerified: false,
        })
        ;[user] = await db.select().from(users).where(eq(users.id, userId))
        if (!user) {
          throw new Error('Failed to create user')
        }
      }

      // Generate verification token
      const token = generateToken()
      const tokenHash = hashToken(token)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      // Store verification record
      await db.insert(verification).values({
        id: randomUUID(),
        identifier: email,
        value: tokenHash,
        expiresAt,
      })

      // Build magic link URL with token and callbackUrl
      const magicLinkUrl = new URL(callbackUrl)
      magicLinkUrl.searchParams.set('token', token)

      // Send email
      const html = await render(
        MagicLinkLoginEmail({ magicLink: magicLinkUrl.toString(), expirationMinutes: 15 }),
      )
      const emailResponse = await fastify.emailProvider.emails.send({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: email,
        subject: 'Sign in to your account',
        html,
      })

      if ('error' in emailResponse && emailResponse.error) {
        throw new Error(
          `Failed to send email: ${emailResponse.error.message || JSON.stringify(emailResponse.error)}`,
        )
      }

      return reply.code(200).send({ ok: true })
    },
  )
}

export default magicLinkRequestRoute
export const prefixOverride = '/auth/magiclink'
