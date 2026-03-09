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
        operationId: 'oauthFacebookAuthorizeUrl',
        description: 'Return Facebook OAuth authorization URL for client-side redirect',
        summary: 'Facebook OAuth authorize URL',
        tags: ['auth'],
        security: [],
        response: {
          200: AuthorizeUrlResponseSchema,
          503: ErrorResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const facebookClientId = env.FACEBOOK_CLIENT_ID
      const oauthFacebookCallbackUrl = env.OAUTH_FACEBOOK_CALLBACK_URL
      if (!facebookClientId || !oauthFacebookCallbackUrl)
        return reply.status(503).send({
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Facebook OAuth is not configured',
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

      const redirectUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
      redirectUrl.searchParams.set('client_id', facebookClientId)
      redirectUrl.searchParams.set('redirect_uri', oauthFacebookCallbackUrl)
      redirectUrl.searchParams.set('scope', 'email,public_profile')
      redirectUrl.searchParams.set('state', state)

      return reply.status(200).send({ redirectUrl: redirectUrl.toString() })
    },
  )
}

export default oauthAuthorizeUrlRoute
export const prefixOverride = '/auth/oauth/facebook'
