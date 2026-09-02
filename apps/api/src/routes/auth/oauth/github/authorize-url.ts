import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { verification } from '../../../../db/schema/index.js'
import { authLoginRouteConfig } from '../../../../lib/auth/index.js'
import { sendCatalogError } from '../../../../lib/catalogs/mapper.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import {
  getOAuthAllowedCallbackUrls,
  resolveOAuthCallbackUrl,
} from '../../../../lib/oauth/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../../schemas.js'

const AuthorizeUrlResponseSchema = Type.Object({
  redirectUrl: Type.String(),
})

const AuthorizeUrlQuerystringSchema = Type.Object({
  redirect_uri: Type.Optional(Type.String()),
})

const oauthAuthorizeUrlRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/authorize-url',
    {
      config: authLoginRouteConfig,
      schema: {
        operationId: 'oauthGithubAuthorizeUrl',
        description: 'Return GitHub OAuth authorization URL for client-side redirect',
        summary: 'GitHub OAuth authorize URL',
        tags: ['auth'],
        security: [],
        querystring: AuthorizeUrlQuerystringSchema,
        response: {
          200: AuthorizeUrlResponseSchema,
          400: ErrorResponseSchema,
          429: RateLimitResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const githubClientId = env.GITHUB_CLIENT_ID
      const githubClientSecret = env.GITHUB_CLIENT_SECRET
      const allowedUrls = getOAuthAllowedCallbackUrls({
        urls: env.OAUTH_GITHUB_CALLBACK_URLS,
        singleUrl: env.OAUTH_GITHUB_CALLBACK_URL,
      })
      const resolved = resolveOAuthCallbackUrl({
        allowedUrls,
        requestedRedirectUri: request.query.redirect_uri,
      })
      if (!resolved.ok)
        return sendCatalogError({
          reply,
          status: resolved.error === 'NOT_CONFIGURED' ? 503 : 400,
          code:
            resolved.error === 'NOT_CONFIGURED' ? 'OAUTH_NOT_CONFIGURED' : 'INVALID_REDIRECT_URI',
        })
      if (!githubClientId || !githubClientSecret)
        return sendCatalogError({ reply, status: 503, code: 'OAUTH_NOT_CONFIGURED' })
      const { redirectUri } = resolved

      const state = randomUUID() + randomUUID().replace(/-/g, '')
      const stateHash = hashToken(state)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      const db = await getDb()
      await db.insert(verification).values({
        id: randomUUID(),
        type: 'oauth_state',
        identifier: stateHash,
        value: stateHash,
        meta: { redirectUri },
        expiresAt,
      })

      const redirectUrl = new URL('https://github.com/login/oauth/authorize')
      redirectUrl.searchParams.set('client_id', githubClientId)
      redirectUrl.searchParams.set('redirect_uri', redirectUri)
      redirectUrl.searchParams.set('scope', 'user:email')
      redirectUrl.searchParams.set('state', state)

      return reply.status(200).send({ redirectUrl: redirectUrl.toString() })
    },
  )
}

export default oauthAuthorizeUrlRoute
export const prefixOverride = '/auth/oauth/github'
