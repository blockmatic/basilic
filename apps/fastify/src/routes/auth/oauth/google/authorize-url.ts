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

const AuthorizeUrlQuerystringSchema = Type.Object({
  redirect_uri: Type.Optional(Type.String()),
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
        operationId: 'oauthGoogleAuthorizeUrl',
        description: 'Return Google OAuth authorization URL for client-side redirect',
        summary: 'Google OAuth authorize URL',
        tags: ['auth'],
        security: [],
        querystring: AuthorizeUrlQuerystringSchema,
        response: {
          200: AuthorizeUrlResponseSchema,
          400: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const googleClientId = env.GOOGLE_CLIENT_ID
      const googleClientSecret = env.GOOGLE_CLIENT_SECRET
      const allowedUrls =
        env.OAUTH_GOOGLE_CALLBACK_URLS ??
        (env.OAUTH_GOOGLE_CALLBACK_URL ? [env.OAUTH_GOOGLE_CALLBACK_URL] : [])
      const defaultUrl = allowedUrls[0]
      if (!googleClientId || !googleClientSecret || !defaultUrl)
        return reply.status(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Google OAuth redirect is not configured',
        })

      const requested = (request.query as { redirect_uri?: string })?.redirect_uri
      const redirectUri = requested
        ? allowedUrls.includes(requested)
          ? requested
          : null
        : defaultUrl
      if (!redirectUri)
        return reply.status(400).send({
          code: 'INVALID_REDIRECT_URI',
          message: 'redirect_uri must be one of the configured callback URLs',
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
        meta: { redirectUri, codeVerifier },
        expiresAt,
      })

      const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      redirectUrl.searchParams.set('client_id', googleClientId)
      redirectUrl.searchParams.set('redirect_uri', redirectUri)
      redirectUrl.searchParams.set('response_type', 'code')
      redirectUrl.searchParams.set('scope', 'openid email profile')
      redirectUrl.searchParams.set('code_challenge', codeChallenge)
      redirectUrl.searchParams.set('code_challenge_method', 'S256')
      redirectUrl.searchParams.set('state', state)

      return reply.status(200).send({ redirectUrl: redirectUrl.toString() })
    },
  )
}

export default oauthAuthorizeUrlRoute
export const prefixOverride = '/auth/oauth/google'
