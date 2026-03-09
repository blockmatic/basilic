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

type TwitterTokenResponse = {
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  error?: string
}

type TwitterUser = { data?: { id: string; name?: string; username?: string } }

const oauthExchangeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/exchange',
    {
      schema: {
        operationId: 'oauthTwitterExchange',
        description: 'Exchange Twitter/X OAuth code for JWTs (PKCE)',
        summary: 'Twitter OAuth exchange',
        tags: ['auth'],
        security: [],
        body: ExchangeSchema,
        response: {
          200: ExchangeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
          502: ErrorResponseSchema,
          503: ErrorResponseSchema,
          504: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const twitterClientId = env.TWITTER_CLIENT_ID
      const twitterClientSecret = env.TWITTER_CLIENT_SECRET
      const oauthTwitterCallbackUrl = env.OAUTH_TWITTER_CALLBACK_URL
      if (!twitterClientId || !twitterClientSecret || !oauthTwitterCallbackUrl)
        return reply.code(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Twitter OAuth is not configured',
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

      const codeVerifier = stateRecord.meta?.codeVerifier
      if (!codeVerifier)
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Missing code verifier for Twitter PKCE',
        })

      await db.delete(verification).where(eq(verification.id, stateRecord.id))

      const tokenBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        redirect_uri: oauthTwitterCallbackUrl,
      })

      const fetchTimeoutMs = 15_000
      const basicAuth = Buffer.from(`${twitterClientId}:${twitterClientSecret}`).toString('base64')

      let tokenRes: Response
      try {
        tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
          body: tokenBody.toString(),
          signal: AbortSignal.timeout(fetchTimeoutMs),
        })
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
          return reply.code(504).send({
            code: 'UPSTREAM_TIMEOUT',
            message: 'Token exchange timed out',
          })
        request.log.warn({ err }, 'Twitter token exchange failed')
        return reply.code(502).send({
          code: 'UPSTREAM_SERVICE_ERROR',
          message: 'Failed to exchange code for token',
        })
      }

      if (!tokenRes.ok) {
        request.log.warn({ status: tokenRes.status }, 'Twitter token exchange non-ok response')
        return reply.code(502).send({
          code: 'UPSTREAM_SERVICE_ERROR',
          message: 'Failed to exchange code for token',
        })
      }

      const tokenData = (await tokenRes.json()) as TwitterTokenResponse
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

      let userRes: Response
      try {
        userRes = await fetch('https://api.x.com/2/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(fetchTimeoutMs),
        })
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
          return reply.code(504).send({
            code: 'UPSTREAM_TIMEOUT',
            message: 'Failed to fetch Twitter user (timeout)',
          })
        request.log.warn({ err }, 'Twitter user fetch failed')
        return reply.code(502).send({
          code: 'UPSTREAM_SERVICE_ERROR',
          message: 'Failed to fetch Twitter user',
        })
      }

      if (!userRes.ok) {
        request.log.warn({ status: userRes.status }, 'Twitter user fetch non-ok response')
        return reply.code(502).send({
          code: 'UPSTREAM_SERVICE_ERROR',
          message: 'Failed to fetch Twitter user',
        })
      }

      const userData = (await userRes.json()) as TwitterUser
      const twUser = userData.data
      if (!twUser?.id)
        return reply.code(400).send({
          code: 'FETCH_USER_FAILED',
          message: 'Invalid Twitter user response',
        })

      const accountId = twUser.id
      const name = twUser.name ?? twUser.username ?? 'Twitter user'

      const accountData = {
        accessToken,
        refreshToken: tokenData.refresh_token ?? null,
        accessTokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        refreshTokenExpiresAt: null as Date | null,
        scope: 'tweet.read users.read offline.access',
      }

      let txResult: { userId: string; sessionId: string; refreshJti: string }
      try {
        txResult = await db.transaction(async tx => {
          const [existingAccount] = await tx
            .select()
            .from(account)
            .where(and(eq(account.providerId, 'twitter'), eq(account.accountId, accountId)))

          let user: typeof users.$inferSelect | undefined
          if (existingAccount) {
            ;[user] = await tx.select().from(users).where(eq(users.id, existingAccount.userId))
          }
          if (!user) {
            const userId = randomUUID()
            await tx.insert(users).values({
              id: userId,
              email: null,
              emailVerified: false,
              name,
            })
            ;[user] = await tx.select().from(users).where(eq(users.id, userId))
            if (!user) throw new Error('USER_CREATE_FAILED')
          }

          const accountRow = {
            id: existingAccount?.id ?? randomUUID(),
            userId: user.id,
            accountId,
            providerId: 'twitter' as const,
          }

          if (existingAccount) {
            const encrypted = encryptAccountTokens({
              accessToken: accountData.accessToken,
              refreshToken: accountData.refreshToken,
              updatedAt: new Date(),
            })
            await tx
              .update(account)
              .set({
                accessToken: encrypted.accessToken,
                refreshToken: encrypted.refreshToken,
                accessTokenExpiresAt: accountData.accessTokenExpiresAt,
                refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
                scope: accountData.scope,
                updatedAt: encrypted.updatedAt ?? new Date(),
              })
              .where(eq(account.id, existingAccount.id))
          } else {
            const toInsert = encryptAccountTokens({
              ...accountRow,
              accessToken: accountData.accessToken,
              refreshToken: accountData.refreshToken,
              idToken: null as string | null,
              accessTokenExpiresAt: accountData.accessTokenExpiresAt,
              refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
              scope: accountData.scope,
            })
            await tx.insert(account).values(toInsert)
          }

          const sessionId = randomUUID()
          const refreshJti = generateJti()
          const refreshJtiHash = hashToken(refreshJti)
          const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

          await tx.insert(sessions).values({
            id: sessionId,
            userId: user.id,
            token: refreshJtiHash,
            expiresAt: sessionExpiresAt,
          })

          return { userId: user.id, sessionId, refreshJti }
        })
      } catch (err) {
        if (err instanceof Error && err.message === 'USER_CREATE_FAILED')
          return reply.code(500).send({
            code: 'USER_CREATE_FAILED',
            message: 'Failed to create user',
          })
        throw err
      }

      const accessPayload = createAccessTokenPayload({
        userId: txResult.userId,
        sessionId: txResult.sessionId,
      })
      const refreshPayload = createRefreshTokenPayload({
        userId: txResult.userId,
        sessionId: txResult.sessionId,
        jti: txResult.refreshJti,
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
export const prefixOverride = '/auth/oauth/twitter'
