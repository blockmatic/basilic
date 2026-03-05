import { randomUUID } from 'node:crypto'
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

const oauthAuthorizeUrlRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/authorize-url',
    {
      schema: {
        operationId: 'oauthGithubAuthorizeUrl',
        description: 'Return GitHub OAuth authorization URL for client-side redirect',
        summary: 'GitHub OAuth authorize URL',
        tags: ['auth'],
        security: [],
        response: {
          200: AuthorizeUrlResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const { GITHUB_CLIENT_ID, OAUTH_GITHUB_CALLBACK_URL } = env
      if (!GITHUB_CLIENT_ID || !OAUTH_GITHUB_CALLBACK_URL)
        return reply.status(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'GitHub OAuth is not configured',
        })

      const state = randomUUID() + randomUUID().replace(/-/g, '')
      const stateHash = hashToken(state)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      const db = await getDb()
      await db.insert(verification).values({
        id: randomUUID(),
        type: 'oauth_state',
        identifier: stateHash,
        value: stateHash,
        expiresAt,
      })

      const redirectUrl = new URL('https://github.com/login/oauth/authorize')
      redirectUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
      redirectUrl.searchParams.set('redirect_uri', OAUTH_GITHUB_CALLBACK_URL)
      redirectUrl.searchParams.set('scope', 'user:email')
      redirectUrl.searchParams.set('state', state)

      return reply.status(200).send({ redirectUrl: redirectUrl.toString() })
    },
  )
}

export default oauthAuthorizeUrlRoute
export const prefixOverride = '/auth/oauth/github'
