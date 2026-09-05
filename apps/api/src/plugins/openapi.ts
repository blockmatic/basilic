import swagger from '@fastify/swagger'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { openapiSecurity } from '../lib/openapi-security.js'

const openapi: FastifyPluginAsync = async fastify => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Basilic API',
        version: '1.0.0',
        description: 'Basilic API documentation',
      },
      ...openapiSecurity,
    },
  })

  // Note: Scalar UI is now served via custom route at /reference
  // The Scalar plugin is not registered here to allow custom HTML wrapper with login
  // OpenAPI JSON is served at /reference/openapi.json via custom route
}

export default fp(openapi, {
  name: 'openapi',
})
