import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
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
import { validateAndConsumeOAuthState } from '../../../../lib/oauth-exchange-state.js'
import { findOrCreateUserByEmail } from '../../../../lib/oauth-user.js'
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

type GoogleTokenResponse = {
  access_token: string
  token_type: string
  expires_in?: number
  scope?: string
  refresh_token?: string
  id_token?: string
  error?: string
}

type GoogleUser = { id: string; email?: string; name?: string; verified_email?: boolean }

const oauthExchangeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/exchange',
    {
      schema: {
        operationId: 'oauthGoogleExchange',
        description: 'Exchange Google OAuth code for JWTs',
        summary: 'Google OAuth exchange',
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
          504: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const googleClientId = env.GOOGLE_CLIENT_ID
      const googleClientSecret = env.GOOGLE_CLIENT_SECRET
      const allowedUrls =
        env.OAUTH_GOOGLE_CALLBACK_URLS ??
        (env.OAUTH_GOOGLE_CALLBACK_URL ? [env.OAUTH_GOOGLE_CALLBACK_URL] : [])
      const defaultUrl = allowedUrls[0]
      if (!googleClientId || !googleClientSecret || !defaultUrl)
        return reply.code(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Google OAuth redirect is not configured',
        })

      const { code, state } = request.body
      const stateHash = hashToken(state)

      const db = await getDb()
      const validated = await validateAndConsumeOAuthState({
        db,
        stateHash,
        request,
        reply,
        preConsumeCheck: r =>
          !r.meta?.codeVerifier
            ? { code: 'INVALID_STATE', message: 'Missing code verifier for Google PKCE' }
            : null,
      })
      if (!validated.ok) return
      const { isLinkMode, linkUserId, stateRecord } = validated
      const redirectUri = stateRecord.meta?.redirectUri ?? defaultUrl
      const codeVerifier = stateRecord.meta?.codeVerifier
      if (!codeVerifier)
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Missing code verifier for Google PKCE',
        })

      const tokenBody = new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      })

      const fetchTimeoutMs = 15_000
      let tokenRes: Response
      try {
        tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenBody.toString(),
          signal: AbortSignal.timeout(fetchTimeoutMs),
        })
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
          return reply.code(504).send({
            code: 'TOKEN_EXCHANGE_FAILED',
            message: 'Token exchange timed out',
          })
        throw err
      }
      if (!tokenRes.ok)
        return reply.code(400).send({
          code: 'TOKEN_EXCHANGE_FAILED',
          message: 'Failed to exchange code for token',
        })

      const tokenData = (await tokenRes.json()) as GoogleTokenResponse
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
        userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(fetchTimeoutMs),
        })
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
          return reply.code(504).send({
            code: 'USER_INFO_FAILED',
            message: 'Failed to fetch Google user (timeout)',
          })
        throw err
      }
      if (!userRes.ok)
        return reply.code(400).send({
          code: 'USER_INFO_FAILED',
          message: 'Failed to fetch Google user',
        })

      const gUser = (await userRes.json()) as GoogleUser
      const accountId = gUser.id
      const email = gUser.email ?? ''
      const name = gUser.name ?? 'Google user'
      const verifiedEmail = gUser.verified_email ?? false

      if (!email || !verifiedEmail)
        return reply.code(400).send({
          code: 'EMAIL_REQUIRED',
          message: 'Could not retrieve verified email from Google',
        })

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(and(eq(account.providerId, 'google'), eq(account.accountId, accountId)))

      if (isLinkMode)
        if (existingAccount && existingAccount.userId !== linkUserId)
          return reply.code(409).send({
            code: 'PROVIDER_ALREADY_LINKED',
            message: 'This Google account is already linked to another user',
          })

      let user: { id: string }
      if (isLinkMode && linkUserId) {
        const [u] = await db.select().from(users).where(eq(users.id, linkUserId))
        if (!u)
          return reply.code(401).send({
            code: 'INVALID_STATE',
            message: 'User not found for link',
          })
        user = u
      } else if (existingAccount) {
        const [u] = await db.select().from(users).where(eq(users.id, existingAccount.userId))
        if (!u)
          return reply.code(500).send({
            code: 'USER_NOT_FOUND',
            message: 'Account references missing user',
          })
        user = u
      } else {
        const u = await findOrCreateUserByEmail(db, { email, name, emailVerified: true })
        if (!u)
          return reply.code(500).send({
            code: 'USER_CREATE_FAILED',
            message: 'Failed to create or find user',
          })
        user = u
      }

      const accountData = {
        id: existingAccount?.id ?? randomUUID(),
        userId: user.id,
        accountId,
        providerId: 'google',
        accessToken,
        refreshToken: tokenData.refresh_token ?? null,
        idToken: tokenData.id_token ?? null,
        accessTokenExpiresAt: new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000),
        refreshTokenExpiresAt: null as Date | null,
        scope: tokenData.scope ?? 'openid email profile',
      }

      if (existingAccount) {
        const encrypted = encryptAccountTokens({
          accessToken: accountData.accessToken,
          refreshToken: accountData.refreshToken,
          idToken: accountData.idToken,
          updatedAt: new Date(),
        })
        await db
          .update(account)
          .set({
            accessToken: encrypted.accessToken,
            refreshToken: encrypted.refreshToken ?? null,
            idToken: encrypted.idToken ?? null,
            updatedAt: encrypted.updatedAt ?? new Date(),
            accessTokenExpiresAt: accountData.accessTokenExpiresAt,
            scope: accountData.scope,
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
export const prefixOverride = '/auth/oauth/google'
