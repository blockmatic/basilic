import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { encryptAccountTokens } from '../../../../db/account.js'
import { getDb } from '../../../../db/index.js'
import { account, users } from '../../../../db/schema/index.js'
import { authLoginRouteConfig } from '../../../../lib/auth/index.js'
import {
  type ErrorCode,
  sendCatalogError,
  sendServerCatalogError,
} from '../../../../lib/catalogs/mapper.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import {
  buildTokenExchangeError,
  buildUserInfoError,
  fetchGoogleTokens,
  fetchGoogleUserInfo,
  findOrCreateUserByEmail,
  type GoogleTokenResponse,
  getOAuthAllowedCallbackUrls,
  type OAuthStateMeta,
  toAllowedStatus,
  validateAndConsumeOAuthState,
} from '../../../../lib/oauth/index.js'
import { createSessionAndIssueTokens } from '../../../../lib/session/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../../schemas.js'

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
        return sendCatalogError({ reply, status: 503, code: 'OAUTH_NOT_CONFIGURED' })

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
        return sendCatalogError({ reply, status: 401, code: 'INVALID_STATE' })
      const meta = stateRecord.meta as OAuthStateMeta | undefined
      const redirectUri = meta?.redirectUri ?? defaultUrl
      if (!allowedUrls.includes(redirectUri))
        return sendCatalogError({ reply, status: 401, code: 'INVALID_STATE' })
      // preConsumeCheck guarantees codeVerifier; this check narrows the type for TS
      const codeVerifier = meta?.codeVerifier
      if (!codeVerifier) return sendCatalogError({ reply, status: 401, code: 'INVALID_STATE' })

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
        if (tokenErr)
          return sendCatalogError({
            reply,
            status: toAllowedStatus(
              tokenErr.status ?? (tokenErr.message.includes('timeout') ? 504 : 400),
            ),
            code: tokenErr.code as ErrorCode,
          })
        throw err
      }

      let gUser: { id: string; email?: string; name?: string; verified_email?: boolean }
      try {
        gUser = await fetchGoogleUserInfo(tokenData.access_token)
      } catch (err) {
        const userErr = buildUserInfoError(err)
        if (userErr)
          return sendCatalogError({
            reply,
            status: toAllowedStatus(
              userErr.status ?? (userErr.message.includes('timeout') ? 504 : 400),
            ),
            code: userErr.code as ErrorCode,
          })
        throw err
      }
      const accountId = gUser.id
      const email = gUser.email ?? ''
      const name = gUser.name ?? 'Google user'
      const verifiedEmail = gUser.verified_email ?? false

      if (!email || !verifiedEmail)
        return sendCatalogError({ reply, status: 400, code: 'EMAIL_REQUIRED' })

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(and(eq(account.providerId, 'google'), eq(account.accountId, accountId)))

      if (isLinkMode)
        if (existingAccount && existingAccount.userId !== linkUserId)
          return sendCatalogError({ reply, status: 409, code: 'PROVIDER_ALREADY_LINKED' })

      let user: { id: string; email?: string | null; name?: string | null }
      if (isLinkMode && linkUserId) {
        const [u] = await db.select().from(users).where(eq(users.id, linkUserId))
        if (!u) return sendCatalogError({ reply, status: 401, code: 'INVALID_STATE' })
        user = u
      } else if (existingAccount) {
        const [u] = await db.select().from(users).where(eq(users.id, existingAccount.userId))
        if (!u) return sendServerCatalogError({ request, reply, code: 'USER_NOT_FOUND' })
        user = u
      } else {
        const u = await findOrCreateUserByEmail(db, { email, name, emailVerified: true })
        if (!u) return sendServerCatalogError({ request, reply, code: 'USER_CREATE_FAILED' })
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

      const { accessToken, refreshToken } = await createSessionAndIssueTokens({
        fastify,
        db,
        request,
        user: { id: user.id, email: user.email, name: user.name },
        signInMethod: 'oauth_google',
      })

      const payload: { token: string; refreshToken: string; redirectTo?: string } = {
        token: accessToken,
        refreshToken,
      }
      if (isLinkMode) payload.redirectTo = '/settings?linked=ok'
      return reply.code(200).send(payload)
    },
  )
}

export default oauthExchangeRoute
export const prefixOverride = '/auth/oauth/google'
