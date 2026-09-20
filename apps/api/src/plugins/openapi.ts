import swagger from '@fastify/swagger'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { getOpenApiDocumentOptions } from '../lib/openapi-spec.js'

const openapi: FastifyPluginAsync = async fastify => {
  await fastify.register(swagger, getOpenApiDocumentOptions())
}

export default fp(openapi, {
  name: 'openapi',
})
