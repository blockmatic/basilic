import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { dbHealth } from '../db/probe.js'

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
        description: 'Readiness: process is up and the database answers SELECT 1',
        summary: 'Returns server health status',
        tags: ['health'],
        security: [],
        response: {
          200: HealthResponseSchema,
          503: HealthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const dbReady = await dbHealth.probe()
      if (!dbReady) return reply.code(503).send({ ok: false, dbReady: false })
      return reply.code(200).send({ ok: true, dbReady: true })
    },
  )
}

export default healthRoutes
