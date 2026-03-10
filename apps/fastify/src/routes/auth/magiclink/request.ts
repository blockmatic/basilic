import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import MagicLinkLoginEmail from '@repo/email/emails/magic-link-login'
import { render } from '@repo/email/render'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { users, verification } from '../../../db/schema/index.js'
import { isUniqueViolation } from '../../../lib/db-errors.js'
import { env } from '../../../lib/env.js'
import { generateLoginCode, hashToken } from '../../../lib/jwt.js'
import { isAllowedUrl } from '../../../lib/url.js'
import { generateFunnyUsername } from '../../../lib/username.js'
import { ErrorResponseSchema } from '../../schemas.js'

async function findOrCreateUserForMagicLink(
  db: Awaited<ReturnType<typeof getDb>>,
  email: string,
): Promise<typeof users.$inferSelect | undefined> {
  const userId = randomUUID()
  const funnyName = `${faker.word.adjective()} ${faker.animal.type()}`
  const maxRetries = 5
  for (let attempt = 0; attempt < maxRetries; attempt++)
    try {
      const [created] = await db.transaction(async tx => {
        const username = await generateFunnyUsername(tx)
        await tx.insert(users).values({
          id: userId,
          email,
          emailVerified: false,
          name: funnyName,
          username,
        })
        const [c] = await tx.select().from(users).where(eq(users.id, userId))
        if (!c) throw new Error('Failed to create user')
        return [c]
      })
      return created
    } catch (err) {
      if (isUniqueViolation(err)) {
        const [existing] = await db.select().from(users).where(eq(users.email, email))
        if (existing) return existing
        if (attempt < maxRetries - 1) continue
      }
      throw err
    }

  return undefined
}

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

      // Validate callback URL (origin allowlist, http/https only, no relative URLs)
      if (!isAllowedUrl(callbackUrl))
        return reply.status(400).send({
          code: 'INVALID_INPUT',
          message: 'Invalid or unsafe callback URL',
        })

      const db = await getDb()

      // Find or create user
      let [user] = await db.select().from(users).where(eq(users.email, email))
      if (!user) {
        const created = await findOrCreateUserForMagicLink(db, email)
        if (!created) throw new Error('Failed to create user')
        user = created
      }

      // Generate 6-digit login code (delivered only in email body, never in URL)
      const code = generateLoginCode()
      const tokenHash = hashToken(code)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      const verificationId = randomUUID()

      const storePlain =
        env.NODE_ENV !== 'production' &&
        env.ALLOW_TEST === true &&
        typeof email === 'string' &&
        email.endsWith('@test.ai')
      await db.insert(verification).values({
        id: verificationId,
        type: 'magic_link',
        identifier: email,
        value: tokenHash,
        ...(storePlain && { tokenPlain: code }),
        expiresAt,
      })

      const magicLinkUrl = new URL(callbackUrl)
      magicLinkUrl.searchParams.set('verificationId', verificationId)

      // Send email
      const html = await render(
        MagicLinkLoginEmail({
          magicLink: magicLinkUrl.toString(),
          loginCode: code,
          expirationMinutes: 15,
        }),
      )
      const emailResponse = await fastify.emailProvider.emails.send({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: email,
        subject: `${code} - ${env.APP_NAME} verification code`,
        html,
      })

      if ('error' in emailResponse && emailResponse.error)
        throw new Error(
          `Failed to send email: ${emailResponse.error.message || JSON.stringify(emailResponse.error)}`,
        )

      return reply.code(200).send({ ok: true })
    },
  )
}

export default magicLinkRequestRoute
export const prefixOverride = '/auth/magiclink'
