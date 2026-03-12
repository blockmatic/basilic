import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../../../lib/env.js'
import { getOAuthAllowedCallbackUrls } from '../../../lib/oauth-shared.js'

function hasRedirectConfig(opts: {
  urls?: string[]
  singleUrl?: string
  clientId?: string
  clientSecret?: string
}): boolean {
  const { urls, singleUrl, clientId, clientSecret } = opts
  const allowedUrls = getOAuthAllowedCallbackUrls({ urls, singleUrl })
  return Boolean(clientId) && Boolean(clientSecret) && allowedUrls.length > 0
}

const ProvidersResponseSchema = Type.Object({
  github: Type.Boolean(),
  githubHasRedirectConfig: Type.Boolean(),
  google: Type.Boolean(),
  googleHasRedirectConfig: Type.Boolean(),
  facebook: Type.Boolean(),
  facebookHasRedirectConfig: Type.Boolean(),
  twitter: Type.Boolean(),
  twitterHasRedirectConfig: Type.Boolean(),
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
          getOAuthAllowedCallbackUrls({
            urls: env.OAUTH_GITHUB_CALLBACK_URLS,
            singleUrl: env.OAUTH_GITHUB_CALLBACK_URL,
          }).length > 0,
        githubHasRedirectConfig: hasRedirectConfig({
          urls: env.OAUTH_GITHUB_CALLBACK_URLS,
          singleUrl: env.OAUTH_GITHUB_CALLBACK_URL,
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        }),
        google: Boolean(env.GOOGLE_CLIENT_ID),
        googleHasRedirectConfig: hasRedirectConfig({
          urls: env.OAUTH_GOOGLE_CALLBACK_URLS,
          singleUrl: env.OAUTH_GOOGLE_CALLBACK_URL,
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
        facebook:
          Boolean(env.FACEBOOK_CLIENT_ID) &&
          Boolean(env.FACEBOOK_CLIENT_SECRET) &&
          getOAuthAllowedCallbackUrls({
            urls: env.OAUTH_FACEBOOK_CALLBACK_URLS,
            singleUrl: env.OAUTH_FACEBOOK_CALLBACK_URL,
          }).length > 0,
        facebookHasRedirectConfig: hasRedirectConfig({
          urls: env.OAUTH_FACEBOOK_CALLBACK_URLS,
          singleUrl: env.OAUTH_FACEBOOK_CALLBACK_URL,
          clientId: env.FACEBOOK_CLIENT_ID,
          clientSecret: env.FACEBOOK_CLIENT_SECRET,
        }),
        twitter:
          Boolean(env.TWITTER_CLIENT_ID) &&
          Boolean(env.TWITTER_CLIENT_SECRET) &&
          getOAuthAllowedCallbackUrls({
            urls: env.OAUTH_TWITTER_CALLBACK_URLS,
            singleUrl: env.OAUTH_TWITTER_CALLBACK_URL,
          }).length > 0,
        twitterHasRedirectConfig: hasRedirectConfig({
          urls: env.OAUTH_TWITTER_CALLBACK_URLS,
          singleUrl: env.OAUTH_TWITTER_CALLBACK_URL,
          clientId: env.TWITTER_CLIENT_ID,
          clientSecret: env.TWITTER_CLIENT_SECRET,
        }),
      }),
  )
}

export default oauthProvidersRoute
export const prefixOverride = '/auth/oauth'
