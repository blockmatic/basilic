import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, inArray } from 'drizzle-orm'
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
import { generateFunnyUsername } from '../../../../lib/username.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const ExchangeSchema = Type.Object({
  code: Type.String(),
  state: Type.String(),
})

const ExchangeResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
  redirectTo: Type.Optional(Type.String()),
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
          409: ErrorResponseSchema,
          500: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const githubClientId = env.GITHUB_CLIENT_ID
      const githubClientSecret = env.GITHUB_CLIENT_SECRET
      const oauthGithubCallbackUrl = env.OAUTH_GITHUB_CALLBACK_URL
      if (!githubClientId || !githubClientSecret || !oauthGithubCallbackUrl)
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
        .where(
          and(
            eq(verification.value, stateHash),
            inArray(verification.type, ['oauth_state', 'oauth_link_state']),
          ),
        )

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

      const isLinkMode = stateRecord.type === 'oauth_link_state'
      const linkUserId = stateRecord.meta?.userId
      await db.delete(verification).where(eq(verification.id, stateRecord.id))

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code,
          redirect_uri: oauthGithubCallbackUrl,
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

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(and(eq(account.providerId, 'github'), eq(account.accountId, accountId)))

      if (isLinkMode) {
        if (!linkUserId)
          return reply.code(401).send({
            code: 'INVALID_STATE',
            message: 'Invalid link state',
          })
        if (existingAccount && existingAccount.userId !== linkUserId)
          return reply.code(409).send({
            code: 'PROVIDER_ALREADY_LINKED',
            message: 'This GitHub account is already linked to another user',
          })
      }

      let user: typeof users.$inferSelect | undefined
      if (isLinkMode && linkUserId) {
        const [u] = await db.select().from(users).where(eq(users.id, linkUserId))
        user = u
        if (!user)
          return reply.code(401).send({
            code: 'INVALID_STATE',
            message: 'User not found for link',
          })
      } else if (existingAccount) {
        const [u] = await db.select().from(users).where(eq(users.id, existingAccount.userId))
        if (!u)
          return reply.code(500).send({
            code: 'USER_NOT_FOUND',
            message: 'Account references missing user',
          })
        user = u
      } else {
        let [u] = await db.select().from(users).where(eq(users.email, email))
        if (!u) {
          const newUserId = randomUUID()
          const username = await generateFunnyUsername(db)
          await db.insert(users).values({
            id: newUserId,
            email,
            emailVerified: true,
            name: ghUser.name ?? ghUser.login,
            username,
          })
          ;[u] = await db.select().from(users).where(eq(users.id, newUserId))
          if (!u) throw new Error('Failed to create user')
        }
        user = u
      }

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

      const payload: { token: string; refreshToken: string; redirectTo?: string } = {
        token: jwtAccess,
        refreshToken: jwtRefresh,
      }
      if (isLinkMode) payload.redirectTo = '/settings?linked=ok'
      return reply.code(200).send(payload)
    },
  )
}

export default oauthExchangeRoute
export const prefixOverride = '/auth/oauth/github'
