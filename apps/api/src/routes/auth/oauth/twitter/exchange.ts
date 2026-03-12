import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { isUniqueViolation } from '../../../../lib/db-errors.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import { validateAndConsumeOAuthState } from '../../../../lib/oauth-exchange-state.js'
import { getOAuthAllowedCallbackUrls, type OAuthStateMeta } from '../../../../lib/oauth-shared.js'
import {
  fetchTwitterOAuthData,
  OAuthUpstreamError,
  runTwitterExchangeTx,
  type TwitterAccountData,
} from '../../../../lib/oauth-twitter.js'
import { createSessionAndIssueTokens } from '../../../../lib/session.js'
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
          409: ErrorResponseSchema,
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
        return reply.code(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Twitter OAuth is not configured',
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
            ? { code: 'INVALID_STATE', message: 'Missing code verifier for Twitter PKCE' }
            : null,
      })
      if (!validated.ok) return
      const { isLinkMode, linkUserId, stateRecord } = validated
      const meta = stateRecord.meta as OAuthStateMeta | undefined
      const redirectUri = meta?.redirectUri ?? defaultUrl
      if (!allowedUrls.includes(redirectUri))
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Invalid or tampered redirect URI',
        })
      const codeVerifier = meta?.codeVerifier
      if (!codeVerifier)
        return reply.code(401).send({
          code: 'INVALID_STATE',
          message: 'Missing code verifier for Twitter PKCE',
        })

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
          return reply.code(504).send({
            code: 'UPSTREAM_TIMEOUT',
            message: 'Token exchange or user fetch timed out',
          })
        if (err instanceof OAuthUpstreamError) {
          const is4xx = err.status >= 400 && err.status < 500
          const errorCode =
            err.stage === 'user_fetch' ? 'FETCH_USER_FAILED' : 'UPSTREAM_SERVICE_ERROR'
          const statusCode: 400 | 401 | 502 = is4xx && err.status === 401 ? 401 : is4xx ? 400 : 502
          return reply.code(statusCode).send({
            code: errorCode,
            message:
              err.stage === 'user_fetch'
                ? 'Invalid Twitter user response'
                : 'Failed to exchange code for token or fetch user',
          })
        }
        request.log.warn({ err }, 'Twitter OAuth fetch failed')
        return reply.code(502).send({
          code: 'UPSTREAM_SERVICE_ERROR',
          message: 'Failed to exchange code for token or fetch user',
        })
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
            return reply.code(409).send({
              code: 'PROVIDER_ALREADY_LINKED',
              message: 'This Twitter account is already linked to another user',
            })
          if (err instanceof Error && err.message === 'USER_NOT_FOUND')
            return reply.code(401).send({
              code: 'INVALID_STATE',
              message: 'User not found for link',
            })
          if (err instanceof Error && err.message === 'USER_CREATE_FAILED')
            return reply.code(500).send({
              code: 'USER_CREATE_FAILED',
              message: 'Failed to create user',
            })
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
