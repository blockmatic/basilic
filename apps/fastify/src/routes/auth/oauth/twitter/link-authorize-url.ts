import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, gte, sql } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { verification } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const linkAuthorizeUrlPerUserPerHour = 10

function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

const AuthorizeUrlResponseSchema = Type.Object({
  redirectUrl: Type.String(),
})

const oauthLinkAuthorizeUrlRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/link-authorize-url',
    {
      schema: {
        operationId: 'oauthTwitterLinkAuthorizeUrl',
        description: 'Return Twitter/X OAuth URL for linking account (Bearer required, PKCE)',
        summary: 'Twitter OAuth link authorize URL',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: AuthorizeUrlResponseSchema,
          401: ErrorResponseSchema,
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

      const twitterClientId = env.TWITTER_CLIENT_ID
      const oauthTwitterCallbackUrl = env.OAUTH_TWITTER_CALLBACK_URL
      if (!twitterClientId || !oauthTwitterCallbackUrl)
        return reply.status(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Twitter OAuth is not configured',
        })

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
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many link requests. Try again later.',
        })

      const state = randomUUID() + randomUUID().replace(/-/g, '')
      const stateHash = hashToken(state)
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = generateCodeChallenge(codeVerifier)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      await db.insert(verification).values({
        id: randomUUID(),
        type: 'oauth_link_state',
        identifier: `link:${userId}`,
        value: stateHash,
        meta: { userId, codeVerifier },
        expiresAt,
      })

      const redirectUrl = new URL('https://x.com/i/oauth2/authorize')
      redirectUrl.searchParams.set('client_id', twitterClientId)
      redirectUrl.searchParams.set('redirect_uri', oauthTwitterCallbackUrl)
      redirectUrl.searchParams.set('scope', 'tweet.read users.read offline.access')
      redirectUrl.searchParams.set('code_challenge', codeChallenge)
      redirectUrl.searchParams.set('code_challenge_method', 'S256')
      redirectUrl.searchParams.set('state', state)
      redirectUrl.searchParams.set('response_type', 'code')

      return reply.status(200).send({ redirectUrl: redirectUrl.toString() })
    },
  )
}

export default oauthLinkAuthorizeUrlRoute
export const prefixOverride = '/auth/oauth/twitter'
