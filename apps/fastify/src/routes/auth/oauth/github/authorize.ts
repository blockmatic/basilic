import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { verification } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import {
  getOAuthAllowedCallbackUrls,
  resolveOAuthCallbackUrl,
} from '../../../../lib/oauth-shared.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const AuthorizeQuerystringSchema = Type.Object({
  redirect_uri: Type.Optional(Type.String()),
})

const oauthAuthorizeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/authorize',
    {
      schema: {
        operationId: 'oauthGithubAuthorize',
        description: 'Redirect to GitHub OAuth authorization',
        summary: 'GitHub OAuth authorize',
        tags: ['auth'],
        security: [],
        querystring: AuthorizeQuerystringSchema,
        response: {
          302: { type: 'string', description: 'Redirect to GitHub' },
          400: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const githubClientId = env.GITHUB_CLIENT_ID
      const allowedUrls = getOAuthAllowedCallbackUrls({
        urls: env.OAUTH_GITHUB_CALLBACK_URLS,
        singleUrl: env.OAUTH_GITHUB_CALLBACK_URL,
      })
      const resolved = resolveOAuthCallbackUrl({
        allowedUrls,
        requestedRedirectUri: (request.query as { redirect_uri?: string })?.redirect_uri,
      })
      if (!resolved.ok)
        return reply.status(resolved.error === 'NOT_CONFIGURED' ? 503 : 400).send({
          code:
            resolved.error === 'NOT_CONFIGURED' ? 'OAUTH_NOT_CONFIGURED' : 'INVALID_REDIRECT_URI',
          message:
            resolved.error === 'NOT_CONFIGURED'
              ? 'GitHub OAuth is not configured'
              : 'redirect_uri must be one of the configured callback URLs',
        })
      if (!githubClientId)
        return reply.status(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'GitHub OAuth is not configured',
        })
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

      return reply.redirect(redirectUrl.toString(), 302)
    },
  )
}

export default oauthAuthorizeRoute
export const prefixOverride = '/auth/oauth/github'
