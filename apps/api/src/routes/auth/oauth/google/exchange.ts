import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { encryptAccountTokens } from '../../../../db/account.js'
import { getDb } from '../../../../db/index.js'
import { account, sessions, users } from '../../../../db/schema/index.js'
import { authLoginRouteConfig } from '../../../../lib/auth-login-route-config.js'
import { env } from '../../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../../../../lib/jwt.js'
import { validateAndConsumeOAuthState } from '../../../../lib/oauth-exchange-state.js'
import {
  fetchGoogleTokens,
  fetchGoogleUserInfo,
  type GoogleTokenResponse,
} from '../../../../lib/oauth-google.js'
import { getOAuthAllowedCallbackUrls, type OAuthStateMeta } from '../../../../lib/oauth-shared.js'
import { findOrCreateUserByEmail } from '../../../../lib/oauth-user.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../../schemas.js'
import { buildTokenExchangeError, buildUserInfoError, toAllowedStatus } from './exchange-helpers.js'

const ExchangeSchema = Type.Object({
  code: Type.String(),
  state: Type.String(),
})

const ExchangeResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
  redirectTo: Type.Optional(Type.String()),
})

const oauthExchangeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/exchange',
    {
      config: authLoginRouteConfig,
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
          429: RateLimitResponseSchema,
          500: ErrorResponseSchema,
          503: ErrorResponseSchema,
          504: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const googleClientId = env.GOOGLE_CLIENT_ID
      const googleClientSecret = env.GOOGLE_CLIENT_SECRET
      const allowedUrls = getOAuthAllowedCallbackUrls({
        urls: env.OAUTH_GOOGLE_CALLBACK_URLS,
        singleUrl: env.OAUTH_GOOGLE_CALLBACK_URL,
      })
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
      if (isLinkMode && !linkUserId)
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Link mode requires user ID',
        })
      const meta = stateRecord.meta as OAuthStateMeta | undefined
      const redirectUri = meta?.redirectUri ?? defaultUrl
      if (!allowedUrls.includes(redirectUri))
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Invalid or tampered redirect URI',
        })
      // preConsumeCheck guarantees codeVerifier; this check narrows the type for TS
      const codeVerifier = meta?.codeVerifier
      if (!codeVerifier)
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Missing code verifier for Google PKCE',
        })

      let tokenData: GoogleTokenResponse
      try {
        tokenData = await fetchGoogleTokens({
          code,
          codeVerifier,
          redirectUri,
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        })
      } catch (err) {
        const tokenErr = buildTokenExchangeError(err)
        if (tokenErr) {
          const raw = tokenErr.status ?? (tokenErr.message.includes('timeout') ? 504 : 400)
          return reply
            .code(toAllowedStatus(raw))
            .send({ code: tokenErr.code, message: tokenErr.message })
        }
        throw err
      }

      let gUser: { id: string; email?: string; name?: string; verified_email?: boolean }
      try {
        gUser = await fetchGoogleUserInfo(tokenData.access_token)
      } catch (err) {
        const userErr = buildUserInfoError(err)
        if (userErr) {
          const raw = userErr.status ?? (userErr.message.includes('timeout') ? 504 : 400)
          return reply
            .code(toAllowedStatus(raw))
            .send({ code: userErr.code, message: userErr.message })
        }
        throw err
      }
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
        accessToken: tokenData.access_token,
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
            refreshToken: tokenData.refresh_token
              ? (encrypted.refreshToken ?? null)
              : existingAccount.refreshToken,
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
