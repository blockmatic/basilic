import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import MagicLinkLoginEmail from '@repo/email/emails/magic-link-login'
import { render } from '@repo/email/render'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { users, verification } from '../../../db/schema/index.js'
import { authLoginRouteConfig } from '../../../lib/auth/index.js'
import { isUniqueViolation } from '../../../lib/db-errors.js'
import { sendMail } from '../../../lib/email.js'
import { findUserByNormalizedEmail } from '../../../lib/email-identity.js'
import { env } from '../../../lib/env.js'
import { generateLoginCode, hashLoginCode } from '../../../lib/jwt.js'
import { isAllowedUrl } from '../../../lib/url.js'
import { generateUsernameForMagicLink } from '../../../lib/username.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

async function findOrCreateUserForMagicLink(
  db: Awaited<ReturnType<typeof getDb>>,
  email: string,
): Promise<typeof users.$inferSelect | undefined> {
  const { normalized } = await findUserByNormalizedEmail({ db, email })
  const userId = randomUUID()
  const funnyName = `${faker.word.adjective()} ${faker.animal.type()}`
  const maxRetries = 5
  for (let attempt = 0; attempt < maxRetries; attempt++)
    try {
      const [created] = await db.transaction(async tx => {
        const username = await generateUsernameForMagicLink(tx, normalized)
        await tx.insert(users).values({
          id: userId,
          email: normalized,
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
        const { user: existing } = await findUserByNormalizedEmail({ db, email: normalized })
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
      config: authLoginRouteConfig,
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
          429: RateLimitResponseSchema,
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
      const { user: existingUser, normalized } = await findUserByNormalizedEmail({ db, email })
      if (!existingUser) {
        const created = await findOrCreateUserForMagicLink(db, normalized)
        if (!created) throw new Error('Failed to create user')
      }

      // Generate 6-digit login code (in email body and link for one-click; manual flow uses email+token)
      const code = generateLoginCode()
      const tokenHash = hashLoginCode(code)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      const verificationId = randomUUID()

      const storePlain =
        env.NODE_ENV !== 'production' &&
        env.ALLOW_TEST === true &&
        typeof normalized === 'string' &&
        normalized.endsWith('@test.ai')

      await db.transaction(async tx => {
        await tx
          .delete(verification)
          .where(and(eq(verification.type, 'magic_link'), eq(verification.identifier, normalized)))

        await tx.insert(verification).values({
          id: verificationId,
          type: 'magic_link',
          identifier: normalized,
          value: tokenHash,
          ...(storePlain && { tokenPlain: code }),
          expiresAt,
        })
      })

      const magicLinkUrl = new URL(callbackUrl)
      magicLinkUrl.searchParams.set('verificationId', verificationId)
      magicLinkUrl.searchParams.set('token', code)

      // Send email
      const html = await render(
        MagicLinkLoginEmail({
          magicLink: magicLinkUrl.toString(),
          loginCode: code,
          expirationMinutes: 15,
        }),
      )
      await sendMail({
        provider: fastify.emailProvider,
        logger: request.log,
        mode: 'throw',
        message: {
          from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
          to: normalized,
          subject: `${code} - ${env.APP_NAME} verification code`,
          html,
        },
      })

      return reply.code(200).send({ ok: true })
    },
  )
}

export default magicLinkRequestRoute
export const prefixOverride = '/auth/magiclink'
