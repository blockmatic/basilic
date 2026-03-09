import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import { encryptAccountTokens } from '../../../../db/account.js'
import { getDb } from '../../../../db/index.js'
import { account, users } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import { createSessionAndIssueTokens } from '../../../../lib/session.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const VerifyIdTokenSchema = Type.Object({
  credential: Type.String(),
})

const VerifyIdTokenResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const oauthVerifyIdTokenRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify-id-token',
    {
      schema: {
        operationId: 'oauthGoogleVerifyIdToken',
        description: 'Verify Google One Tap ID token and issue JWTs',
        summary: 'Google OAuth verify ID token',
        tags: ['auth'],
        security: [],
        body: VerifyIdTokenSchema,
        response: {
          200: VerifyIdTokenResponseSchema,
          400: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const googleClientId = env.GOOGLE_CLIENT_ID
      if (!googleClientId)
        return reply.code(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Google OAuth is not configured',
        })

      const { credential } = request.body

      const client = new OAuth2Client(googleClientId)
      let payload: {
        sub: string
        email?: string
        email_verified?: boolean
        name?: string
      } | null = null
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: googleClientId,
        })
        const p = ticket.getPayload()
        if (!p?.sub)
          return reply.code(400).send({
            code: 'INVALID_CREDENTIAL',
            message: 'Invalid Google ID token',
          })
        payload = p
      } catch {
        return reply.code(400).send({
          code: 'INVALID_CREDENTIAL',
          message: 'Failed to verify Google ID token',
        })
      }

      if (!payload) throw new Error('Invalid payload')

      const accountId = payload.sub
      const email = payload.email ?? ''
      const emailVerified = !!payload.email_verified
      if (!emailVerified || !email)
        return reply.code(400).send({
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Could not retrieve verified email from Google',
        })

      const db = await getDb()
      const { token, refreshToken } = await db.transaction(async tx => {
        const [existingAccount] = await tx
          .select()
          .from(account)
          .where(and(eq(account.providerId, 'google'), eq(account.accountId, accountId)))

        let user: typeof users.$inferSelect | undefined
        if (existingAccount) {
          ;[user] = await tx.select().from(users).where(eq(users.id, existingAccount.userId))
        }
        if (!user) {
          const name = payload?.name ?? email
          const [byEmail] = await tx.select().from(users).where(eq(users.email, email))
          if (byEmail) user = byEmail
          if (!user) {
            const userId = randomUUID()
            await tx.insert(users).values({
              id: userId,
              email,
              emailVerified: true,
              name,
            })
            ;[user] = await tx.select().from(users).where(eq(users.id, userId))
            if (!user) throw new Error('Failed to create user')
          }
        }

        const accountData = {
          id: existingAccount?.id ?? randomUUID(),
          userId: user.id,
          accountId,
          providerId: 'google' as const,
          accessToken: null as string | null,
          refreshToken: null as string | null,
          idToken: null as string | null,
          accessTokenExpiresAt: null as Date | null,
          refreshTokenExpiresAt: null as Date | null,
          scope: 'openid email profile',
        }

        if (existingAccount) {
          const encrypted = encryptAccountTokens({ updatedAt: new Date() })
          await tx
            .update(account)
            .set({ updatedAt: encrypted.updatedAt ?? new Date() })
            .where(eq(account.id, existingAccount.id))
        } else {
          await tx.insert(account).values({
            id: accountData.id,
            userId: accountData.userId,
            accountId: accountData.accountId,
            providerId: accountData.providerId,
            scope: accountData.scope,
          })
        }

        const { accessToken, refreshToken } = await createSessionAndIssueTokens({
          fastify,
          db: tx as unknown as Awaited<ReturnType<typeof getDb>>,
          userId: user.id,
        })
        return { token: accessToken, refreshToken }
      })

      return reply.code(200).send({ token, refreshToken })
    },
  )
}

export default oauthVerifyIdTokenRoute
export const prefixOverride = '/auth/oauth/google'
