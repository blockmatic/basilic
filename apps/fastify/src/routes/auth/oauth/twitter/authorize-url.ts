import { createHash, randomBytes, randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { verification } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import { hashToken } from '../../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const AuthorizeUrlResponseSchema = Type.Object({
  redirectUrl: Type.String(),
})

function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

const oauthAuthorizeUrlRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/authorize-url',
    {
      schema: {
        operationId: 'oauthTwitterAuthorizeUrl',
        description: 'Return Twitter/X OAuth authorization URL for client-side redirect (PKCE)',
        summary: 'Twitter OAuth authorize URL',
        tags: ['auth'],
        security: [],
        response: {
          200: AuthorizeUrlResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const twitterClientId = env.TWITTER_CLIENT_ID
      const oauthTwitterCallbackUrl = env.OAUTH_TWITTER_CALLBACK_URL
      if (!twitterClientId || !oauthTwitterCallbackUrl)
        return reply.status(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Twitter OAuth is not configured',
        })

      const state = randomUUID() + randomUUID().replace(/-/g, '')
      const stateHash = hashToken(state)
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = generateCodeChallenge(codeVerifier)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      const db = await getDb()
      await db.insert(verification).values({
        id: randomUUID(),
        type: 'oauth_state',
        identifier: stateHash,
        value: stateHash,
        expiresAt,
        meta: { codeVerifier },
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

export default oauthAuthorizeUrlRoute
export const prefixOverride = '/auth/oauth/twitter'
