import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { encryptAccountTokens } from '../../../../db/account.js'
import { getDb } from '../../../../db/index.js'
import { account, users } from '../../../../db/schema/index.js'
import { authLoginRouteConfig } from '../../../../lib/auth/index.js'
import { sendCatalogError, sendServerCatalogError } from '../../../../lib/catalogs/mapper.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import {
  findOrCreateUserByEmail,
  getOAuthAllowedCallbackUrls,
  type OAuthStateMeta,
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

type FacebookTokenResponse = {
  access_token: string
  token_type: string
  expires_in?: number
}

type FacebookUser = { id: string; name?: string; email?: string }

const oauthExchangeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/exchange',
    {
      config: authLoginRouteConfig,
      schema: {
        operationId: 'oauthFacebookExchange',
        description: 'Exchange Facebook OAuth code for JWTs',
        summary: 'Facebook OAuth exchange',
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
      const facebookClientId = env.FACEBOOK_CLIENT_ID
      const facebookClientSecret = env.FACEBOOK_CLIENT_SECRET
      const allowedUrls = getOAuthAllowedCallbackUrls({
        urls: env.OAUTH_FACEBOOK_CALLBACK_URLS,
        singleUrl: env.OAUTH_FACEBOOK_CALLBACK_URL,
      })
      const defaultUrl = allowedUrls[0]
      if (!facebookClientId || !facebookClientSecret || !defaultUrl)
        return sendCatalogError({ reply, status: 503, code: 'OAUTH_NOT_CONFIGURED' })

      const { code, state } = request.body
      const stateHash = hashToken(state)

      const db = await getDb()
      const validated = await validateAndConsumeOAuthState({ db, stateHash, request, reply })
      if (!validated.ok) return
      const { isLinkMode, linkUserId, stateRecord } = validated
      const meta = stateRecord.meta as OAuthStateMeta | undefined
      const redirectUri = meta?.redirectUri ?? defaultUrl
      if (!allowedUrls.includes(redirectUri))
        return sendCatalogError({ reply, status: 401, code: 'INVALID_STATE' })

      const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token')
      tokenUrl.searchParams.set('client_id', facebookClientId)
      tokenUrl.searchParams.set('client_secret', facebookClientSecret)
      tokenUrl.searchParams.set('redirect_uri', redirectUri)
      tokenUrl.searchParams.set('code', code)

      const fetchTimeoutMs = 15_000
      let tokenRes: Response
      try {
        tokenRes = await fetch(tokenUrl.toString(), {
          signal: AbortSignal.timeout(fetchTimeoutMs),
        })
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
          return sendCatalogError({ reply, status: 504, code: 'TOKEN_EXCHANGE_FAILED' })
        throw err
      }
      if (!tokenRes.ok)
        return sendCatalogError({ reply, status: 400, code: 'TOKEN_EXCHANGE_FAILED' })

      const tokenData = (await tokenRes.json()) as FacebookTokenResponse & {
        error?: { message: string }
      }
      if (tokenData.error)
        return sendCatalogError({ reply, status: 400, code: 'TOKEN_EXCHANGE_FAILED' })

      const accessToken = tokenData.access_token
      if (!accessToken)
        return sendCatalogError({ reply, status: 400, code: 'TOKEN_EXCHANGE_FAILED' })

      const userUrl = new URL('https://graph.facebook.com/me')
      userUrl.searchParams.set('fields', 'id,name,email')
      userUrl.searchParams.set('access_token', accessToken)

      let userRes: Response
      try {
        userRes = await fetch(userUrl.toString(), {
          signal: AbortSignal.timeout(fetchTimeoutMs),
        })
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
          return sendCatalogError({ reply, status: 504, code: 'USER_INFO_FAILED' })
        throw err
      }
      if (!userRes.ok) return sendCatalogError({ reply, status: 400, code: 'USER_INFO_FAILED' })

      const fbUser = (await userRes.json()) as FacebookUser
      const accountId = fbUser.id
      const email = fbUser.email ?? ''
      const name = fbUser.name ?? 'Facebook user'

      if (!email) return sendCatalogError({ reply, status: 400, code: 'EMAIL_REQUIRED' })

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(and(eq(account.providerId, 'facebook'), eq(account.accountId, accountId)))

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
        providerId: 'facebook',
        accessToken,
        refreshToken: null as string | null,
        idToken: null as string | null,
        accessTokenExpiresAt: new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000),
        refreshTokenExpiresAt: null as Date | null,
        scope: 'email,public_profile',
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

      const { accessToken: jwtAccess, refreshToken: jwtRefresh } =
        await createSessionAndIssueTokens({
          fastify,
          db,
          request,
          user: { id: user.id, email: user.email, name: user.name },
          signInMethod: 'oauth_facebook',
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
export const prefixOverride = '/auth/oauth/facebook'
