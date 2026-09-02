import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, gte, sql } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { verification } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import {
  getOAuthAllowedCallbackUrls,
  resolveOAuthCallbackUrl,
} from '../../../../lib/oauth/index.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const linkAuthorizeUrlPerUserPerHour = 10

const AuthorizeUrlResponseSchema = Type.Object({
  redirectUrl: Type.String(),
})

const LinkAuthorizeUrlQuerystringSchema = Type.Object({
  redirect_uri: Type.Optional(Type.String()),
})

const oauthLinkAuthorizeUrlRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/link-authorize-url',
    {
      schema: {
        operationId: 'oauthGithubLinkAuthorizeUrl',
        description: 'Return GitHub OAuth URL for linking account (Bearer required)',
        summary: 'GitHub OAuth link authorize URL',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        querystring: LinkAuthorizeUrlQuerystringSchema,
        response: {
          200: AuthorizeUrlResponseSchema,
          401: ErrorResponseSchema,
          400: ErrorResponseSchema,
          429: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

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
        return reply.status(resolved.error === 'NOT_CONFIGURED' ? 503 : 400).send({
          code:
            resolved.error === 'NOT_CONFIGURED' ? 'OAUTH_NOT_CONFIGURED' : 'INVALID_REDIRECT_URI',
          message:
            resolved.error === 'NOT_CONFIGURED'
              ? 'GitHub OAuth is not configured'
              : 'redirect_uri must be one of the configured callback URLs',
        })
      if (!githubClientId || !githubClientSecret)
        return reply.status(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'GitHub OAuth is not configured',
        })
      const { redirectUri } = resolved

      const userId = request.session.user.id
      const db = await getDb()
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const [recentCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(verification)
        .where(
          and(
            eq(verification.type, 'oauth_link_state'),
            eq(verification.identifier, `link:${userId}`),
            gte(verification.createdAt, oneHourAgo),
          ),
        )
      if ((recentCount?.count ?? 0) >= linkAuthorizeUrlPerUserPerHour)
        return reply.code(429).send({
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many link requests. Try again later.',
        })

      const state = randomUUID() + randomUUID().replace(/-/g, '')
      const stateHash = hashToken(state)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      await db.insert(verification).values({
        id: randomUUID(),
        type: 'oauth_link_state',
        identifier: `link:${userId}`,
        value: stateHash,
        meta: { userId, redirectUri },
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

export default oauthLinkAuthorizeUrlRoute
export const prefixOverride = '/auth/oauth/github'
