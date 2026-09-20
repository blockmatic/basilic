import type { FastifyPluginAsync } from 'fastify'
import { sendOpenApiDocument } from '../lib/openapi-document.js'

const openapiJsonRoute: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/openapi.json',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
      },
    },
    async (request, reply) => sendOpenApiDocument({ fastify, request, reply }),
  )
}

export default openapiJsonRoute
