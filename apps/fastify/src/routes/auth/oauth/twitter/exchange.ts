import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { verification } from '../../../../db/schema/index.js'
import { isUniqueViolation } from '../../../../lib/db-errors.js'
import { env } from '../../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  hashToken,
} from '../../../../lib/jwt.js'
import {
  fetchTwitterOAuthData,
  runTwitterExchangeTx,
  type TwitterAccountData,
} from '../../../../lib/oauth-twitter.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const ExchangeSchema = Type.Object({
  code: Type.String(),
  state: Type.String(),
})

const ExchangeResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
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

      let accountId: string
      let name: string
      let accountData: TwitterAccountData
      try {
        const oauthData = await fetchTwitterOAuthData({
          code,
          codeVerifier,
          oauthTwitterCallbackUrl,
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
        request.log.warn({ err }, 'Twitter OAuth fetch failed')
        const errorCode =
          err instanceof Error && err.message === 'USER_FETCH_FAILED'
            ? 'FETCH_USER_FAILED'
            : 'UPSTREAM_SERVICE_ERROR'
        return reply.code(errorCode === 'FETCH_USER_FAILED' ? 400 : 502).send({
          code: errorCode,
          message:
            errorCode === 'FETCH_USER_FAILED'
              ? 'Invalid Twitter user response'
              : 'Failed to exchange code for token or fetch user',
        })
      }

      const maxRetries = 5
      let txResult!: { userId: string; sessionId: string; refreshJti: string }
      for (let attempt = 0; attempt < maxRetries; attempt++)
        try {
          txResult = await runTwitterExchangeTx(db, accountId, name, accountData)
          break
        } catch (err) {
          if (err instanceof Error && err.message === 'USER_CREATE_FAILED')
            return reply.code(500).send({
              code: 'USER_CREATE_FAILED',
              message: 'Failed to create user',
            })
          if (isUniqueViolation(err) && attempt < maxRetries - 1) continue
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
