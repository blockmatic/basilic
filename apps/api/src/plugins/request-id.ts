import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { requestIdHeader } from '../lib/http-logging.js'

const requestId: FastifyPluginAsync = async fastify => {
  fastify.addHook('onRequest', async (request, reply) => {
    reply.header(requestIdHeader, request.id)
  })
}

export default fp(requestId)
