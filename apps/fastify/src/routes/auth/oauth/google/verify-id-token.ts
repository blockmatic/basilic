import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import { encryptAccountTokens } from '../../../../db/account.js'
import { getDb } from '../../../../db/index.js'
import { account, sessions, users } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../../../../lib/jwt.js'
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
      const name = payload.name ?? payload.email ?? 'Google user'
      const emailVerified = !!payload.email_verified

      if (!email)
        return reply.code(400).send({
          code: 'EMAIL_REQUIRED',
          message: 'Could not retrieve email from Google',
        })

      const db = await getDb()
      const [existingAccount] = await db
        .select()
        .from(account)
        .where(and(eq(account.providerId, 'google'), eq(account.accountId, accountId)))

      let user: typeof users.$inferSelect | undefined
      if (existingAccount) {
        ;[user] = await db.select().from(users).where(eq(users.id, existingAccount.userId))
      }
      if (!user) {
        const [byEmail] = await db.select().from(users).where(eq(users.email, email))
        if (byEmail) user = byEmail
      }
      if (!user) {
        const userId = randomUUID()
        await db.insert(users).values({
          id: userId,
          email,
          emailVerified,
          name,
        })
        ;[user] = await db.select().from(users).where(eq(users.id, userId))
        if (!user) throw new Error('Failed to create user')
      }

      const accountData = {
        id: existingAccount?.id ?? randomUUID(),
        userId: user.id,
        accountId,
        providerId: 'google',
        accessToken: null as string | null,
        refreshToken: null as string | null,
        idToken: null as string | null,
        accessTokenExpiresAt: null as Date | null,
        refreshTokenExpiresAt: null as Date | null,
        scope: 'openid email profile',
      }

      if (existingAccount) {
        const encrypted = encryptAccountTokens({
          updatedAt: new Date(),
        })
        await db
          .update(account)
          .set({
            updatedAt: encrypted.updatedAt ?? new Date(),
          })
          .where(eq(account.id, existingAccount.id))
      } else {
        await db.insert(account).values({
          id: accountData.id,
          userId: accountData.userId,
          accountId: accountData.accountId,
          providerId: accountData.providerId,
          scope: accountData.scope,
        })
      }

      const sessionId = randomUUID()
      const refreshJti = generateJti()
      const refreshJtiHash = hashToken(refreshJti)
      const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

      await db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        token: refreshJtiHash,
        expiresAt: sessionExpiresAt,
      })

      const accessPayload = createAccessTokenPayload({ userId: user.id, sessionId })
      const refreshPayload = createRefreshTokenPayload({
        userId: user.id,
        sessionId,
        jti: refreshJti,
      })

      const jwtAccess = fastify.jwt.sign(accessPayload, {
        expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
      })
      const jwtRefresh = fastify.jwt.sign(refreshPayload, {
        expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
      })

      return reply.code(200).send({
        token: jwtAccess,
        refreshToken: jwtRefresh,
      })
    },
  )
}

export default oauthVerifyIdTokenRoute
export const prefixOverride = '/auth/oauth/google'
