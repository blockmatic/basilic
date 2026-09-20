import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getRequestOrigin } from '../../lib/agent/index.js'

const LinkTargetSchema = Type.Object({
  href: Type.String({ format: 'uri' }),
  type: Type.String(),
})

const ApiCatalogSchema = Type.Object({
  linkset: Type.Array(
    Type.Object({
      anchor: Type.String({ format: 'uri' }),
      'service-desc': Type.Array(LinkTargetSchema),
      'service-doc': Type.Array(LinkTargetSchema),
      status: Type.Array(LinkTargetSchema),
    }),
  ),
})

const catalogType = 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"'

const apiCatalogRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/api-catalog',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
        response: {
          200: ApiCatalogSchema,
        },
      },
    },
    async (request, reply) => {
      const origin = getRequestOrigin({ request })
      return reply.type(catalogType).send({
        linkset: [
          {
            anchor: `${origin}/`,
            'service-desc': [{ href: `${origin}/openapi.json`, type: 'application/openapi+json' }],
            'service-doc': [{ href: `${origin}/reference`, type: 'text/html' }],
            status: [{ href: `${origin}/health`, type: 'application/json' }],
          },
        ],
      })
    },
  )
}

export default apiCatalogRoute
export const prefixOverride = '/.well-known'
