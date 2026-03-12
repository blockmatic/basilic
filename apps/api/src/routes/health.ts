import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { isDbReady } from '../db/index.js'

export const HealthResponseSchema = Type.Object({
  ok: Type.Boolean(),
  dbReady: Type.Boolean(),
})

const healthRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/health',
    {
      schema: {
        operationId: 'healthCheck',
        description: 'Health check endpoint',
        summary: 'Returns server health status with current ISO datetime',
        tags: ['health'],
        security: [],
        response: {
          200: HealthResponseSchema,
        },
      },
    },
    async (request, reply) => {
      fastify.log.info(
        { origin: request.headers.origin, url: request.url },
        'Health check request received',
      )
      const dbReady = isDbReady()
      return reply.code(200).send({
        ok: true,
        dbReady,
      })
    },
  )
}

export default healthRoutes
