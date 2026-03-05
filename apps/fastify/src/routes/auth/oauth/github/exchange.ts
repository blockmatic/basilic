import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { encryptAccountTokens } from '../../../../db/account.js'
import { getDb } from '../../../../db/index.js'
import { account, sessions, users, verification } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const ExchangeSchema = Type.Object({
  code: Type.String(),
  state: Type.String(),
})

const ExchangeResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

type GitHubTokenResponse = {
  access_token: string
  token_type: string
  scope?: string
}

type GitHubUser = { id: number; login: string; email?: string | null; name?: string | null }
type GitHubEmail = { email: string; primary: boolean; verified: boolean }

const oauthExchangeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/exchange',
    {
      schema: {
        operationId: 'oauthGithubExchange',
        description: 'Exchange GitHub OAuth code for JWTs',
        summary: 'GitHub OAuth exchange',
        tags: ['auth'],
        security: [],
        body: ExchangeSchema,
        response: {
          200: ExchangeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, OAUTH_GITHUB_CALLBACK_URL } = env
      if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !OAUTH_GITHUB_CALLBACK_URL)
        return reply.code(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'GitHub OAuth is not configured',
        })

      const { code, state } = request.body
      const stateHash = hashToken(state)

      const db = await getDb()
      const [stateRecord] = await db
        .select()
        .from(verification)
        .where(and(eq(verification.value, stateHash), eq(verification.type, 'oauth_state')))

      if (!stateRecord)
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Invalid or expired state',
        })

      if (stateRecord.expiresAt < new Date()) {
        await db.delete(verification).where(eq(verification.id, stateRecord.id))
        return reply.code(401).send({
          code: 'EXPIRED_STATE',
          message: 'State has expired',
        })
      }

      await db.delete(verification).where(eq(verification.id, stateRecord.id))

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: OAUTH_GITHUB_CALLBACK_URL,
        }),
      })

      if (!tokenRes.ok)
        return reply.code(400).send({
          code: 'TOKEN_EXCHANGE_FAILED',
          message: 'Failed to exchange code for token',
        })

      const tokenData = (await tokenRes.json()) as GitHubTokenResponse & { error?: string }
      if (tokenData.error)
        return reply.code(400).send({
          code: 'TOKEN_EXCHANGE_FAILED',
          message: tokenData.error,
        })

      const accessToken = tokenData.access_token
      if (!accessToken)
        return reply.code(400).send({
          code: 'TOKEN_EXCHANGE_FAILED',
          message: 'No access token in response',
        })

      const [userRes, emailsRes] = await Promise.all([
        fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
          },
        }),
      ])

      if (!userRes.ok)
        return reply.code(400).send({
          code: 'FETCH_USER_FAILED',
          message: 'Failed to fetch GitHub user',
        })

      const ghUser = (await userRes.json()) as GitHubUser
      const accountId = String(ghUser.id)

      let email: string
      if (ghUser.email) {
        email = ghUser.email
      } else if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as GitHubEmail[]
        const primary = emails.find(e => e.primary && e.verified)
        email = primary?.email ?? emails.find(e => e.verified)?.email ?? ''
      } else {
        email = ''
      }

      if (!email)
        return reply.code(400).send({
          code: 'EMAIL_REQUIRED',
          message: 'Could not retrieve email from GitHub',
        })

      let [user] = await db.select().from(users).where(eq(users.email, email))
      if (!user) {
        const userId = randomUUID()
        await db.insert(users).values({
          id: userId,
          email,
          emailVerified: true,
          name: ghUser.name ?? ghUser.login,
        })
        ;[user] = await db.select().from(users).where(eq(users.id, userId))
        if (!user) throw new Error('Failed to create user')
      }

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(and(eq(account.providerId, 'github'), eq(account.accountId, accountId)))

      const accountData = {
        id: existingAccount?.id ?? randomUUID(),
        userId: user.id,
        accountId,
        providerId: 'github',
        accessToken,
        refreshToken: null as string | null,
        idToken: null as string | null,
        accessTokenExpiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        refreshTokenExpiresAt: null as Date | null,
        scope: 'user:email',
      }

      if (existingAccount) {
        const encrypted = encryptAccountTokens({
          accessToken: accountData.accessToken,
          updatedAt: new Date(),
        })
        await db
          .update(account)
          .set({
            accessToken: encrypted.accessToken,
            updatedAt: encrypted.updatedAt ?? new Date(),
          })
          .where(eq(account.id, existingAccount.id))
      } else {
        const toInsert = encryptAccountTokens({
          id: accountData.id,
          userId: accountData.userId,
          accountId: accountData.accountId,
          providerId: accountData.providerId,
          accessToken: accountData.accessToken,
          refreshToken: accountData.refreshToken,
          idToken: accountData.idToken,
          accessTokenExpiresAt: accountData.accessTokenExpiresAt,
          refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
          scope: accountData.scope,
        })
        await db.insert(account).values(toInsert)
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

export default oauthExchangeRoute
export const prefixOverride = '/auth/oauth/github'
