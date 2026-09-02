import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { authLoginRouteConfig } from '../../../../lib/auth/index.js'
import { sendCatalogError } from '../../../../lib/catalogs/mapper.js'
import { isUniqueViolation } from '../../../../lib/db-errors.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import {
  fetchTwitterOAuthData,
  getOAuthAllowedCallbackUrls,
  type OAuthStateMeta,
  OAuthUpstreamError,
  runTwitterExchangeTx,
  type TwitterAccountData,
  validateAndConsumeOAuthState,
} from '../../../../lib/oauth/index.js'
import { createSessionAndIssueTokens } from '../../../../lib/session.js'
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
          409: ErrorResponseSchema,
          429: RateLimitResponseSchema,
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
      const allowedUrls = getOAuthAllowedCallbackUrls({
        urls: env.OAUTH_TWITTER_CALLBACK_URLS,
        singleUrl: env.OAUTH_TWITTER_CALLBACK_URL,
      })
      const defaultUrl = allowedUrls[0]
      if (!twitterClientId || !twitterClientSecret || !defaultUrl)
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
            ? { code: 'INVALID_STATE', message: 'Missing code verifier for Twitter PKCE' }
            : null,
      })
      if (!validated.ok) return
      const { isLinkMode, linkUserId, stateRecord } = validated
      const meta = stateRecord.meta as OAuthStateMeta | undefined
      const redirectUri = meta?.redirectUri ?? defaultUrl
      if (!allowedUrls.includes(redirectUri))
        return sendCatalogError({ reply, status: 401, code: 'INVALID_STATE' })
      const codeVerifier = meta?.codeVerifier
      if (!codeVerifier) return sendCatalogError({ reply, status: 401, code: 'INVALID_STATE' })

      let accountId: string
      let name: string
      let accountData: TwitterAccountData
      try {
        const oauthData = await fetchTwitterOAuthData({
          code,
          codeVerifier,
          redirectUri,
          twitterClientId,
          twitterClientSecret,
        })
        accountId = oauthData.accountId
        name = oauthData.name
        accountData = oauthData.accountData
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
          return sendCatalogError({ reply, status: 504, code: 'UPSTREAM_TIMEOUT' })
        if (err instanceof OAuthUpstreamError) {
          const is4xx = err.status >= 400 && err.status < 500
          const errorCode =
            err.stage === 'user_fetch' ? 'FETCH_USER_FAILED' : 'UPSTREAM_SERVICE_ERROR'
          const statusCode: 400 | 401 | 502 = is4xx && err.status === 401 ? 401 : is4xx ? 400 : 502
          return sendCatalogError({ reply, status: statusCode, code: errorCode })
        }
        request.log.warn({ err }, 'Twitter OAuth fetch failed')
        return sendCatalogError({ reply, status: 502, code: 'UPSTREAM_SERVICE_ERROR' })
      }

      const maxRetries = 5
      let txResult!: { userId: string }
      for (let attempt = 0; attempt < maxRetries; attempt++)
        try {
          txResult = await runTwitterExchangeTx({
            db,
            accountId,
            name,
            accountData,
            ...(isLinkMode && linkUserId && { linkUserId }),
          })
          break
        } catch (err) {
          if (err instanceof Error && err.message === 'PROVIDER_ALREADY_LINKED')
            return sendCatalogError({ reply, status: 409, code: 'PROVIDER_ALREADY_LINKED' })
          if (err instanceof Error && err.message === 'USER_NOT_FOUND')
            return sendCatalogError({ reply, status: 401, code: 'INVALID_STATE' })
          if (err instanceof Error && err.message === 'USER_CREATE_FAILED')
            return sendCatalogError({ reply, status: 500, code: 'USER_CREATE_FAILED' })
          if (isUniqueViolation(err) && attempt < maxRetries - 1) continue
          throw err
        }

      const { accessToken, refreshToken } = await createSessionAndIssueTokens({
        fastify,
        db,
        userId: txResult.userId,
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
export const prefixOverride = '/auth/oauth/twitter'
