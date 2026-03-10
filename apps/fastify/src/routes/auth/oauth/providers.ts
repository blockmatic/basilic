import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../../../lib/env.js'

const ProvidersResponseSchema = Type.Object({
  github: Type.Boolean(),
  google: Type.Boolean(),
  googleRedirect: Type.Boolean(),
  facebook: Type.Boolean(),
  twitter: Type.Boolean(),
})

const oauthProvidersRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/providers',
    {
      schema: {
        operationId: 'oauthProviders',
        description: 'Return which OAuth providers are configured',
        summary: 'OAuth providers availability',
        tags: ['auth'],
        security: [],
        response: {
          200: ProvidersResponseSchema,
        },
      },
    },
    async (_request, reply) =>
      reply.status(200).send({
        github:
          Boolean(env.GITHUB_CLIENT_ID) &&
          Boolean(env.GITHUB_CLIENT_SECRET) &&
          Boolean(env.OAUTH_GITHUB_CALLBACK_URL),
        google: Boolean(env.GOOGLE_CLIENT_ID),
        googleRedirect: (() => {
          const urls =
            env.OAUTH_GOOGLE_CALLBACK_URLS ??
            (env.OAUTH_GOOGLE_CALLBACK_URL ? [env.OAUTH_GOOGLE_CALLBACK_URL] : [])
          return (
            Boolean(env.GOOGLE_CLIENT_ID) && Boolean(env.GOOGLE_CLIENT_SECRET) && urls.length > 0
          )
        })(),
        facebook:
          Boolean(env.FACEBOOK_CLIENT_ID) &&
          Boolean(env.FACEBOOK_CLIENT_SECRET) &&
          Boolean(env.OAUTH_FACEBOOK_CALLBACK_URL),
        twitter:
          Boolean(env.TWITTER_CLIENT_ID) &&
          Boolean(env.TWITTER_CLIENT_SECRET) &&
          Boolean(env.OAUTH_TWITTER_CALLBACK_URL),
      }),
  )
}

export default oauthProvidersRoute
export const prefixOverride = '/auth/oauth'
