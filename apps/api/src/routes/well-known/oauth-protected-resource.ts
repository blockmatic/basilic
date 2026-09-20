import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getLandingUrls, getRequestOrigin } from '../../lib/agent/index.js'

const ProtectedResourceSchema = Type.Object({
  resource: Type.String({ format: 'uri' }),
  resource_name: Type.String(),
  bearer_methods_supported: Type.Array(Type.Literal('header')),
  resource_documentation: Type.String({ format: 'uri' }),
  resource_tos_uri: Type.String({ format: 'uri' }),
  resource_policy_uri: Type.String({ format: 'uri' }),
})

const oauthProtectedResourceRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/oauth-protected-resource',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
        response: {
          200: ProtectedResourceSchema,
        },
      },
    },
    async (request, reply) => {
      const origin = getRequestOrigin({ request })
      const urls = getLandingUrls()
      return reply.send({
        resource: origin,
        resource_name: 'Basilic Fastify API',
        bearer_methods_supported: ['header'],
        resource_documentation: `${urls.docs}/docs/architecture/authentication`,
        resource_tos_uri: urls.terms,
        resource_policy_uri: urls.privacy,
      })
    },
  )
}

export default oauthProtectedResourceRoute
export const prefixOverride = '/.well-known'
