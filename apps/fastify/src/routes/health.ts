import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

export const HealthResponseSchema = Type.Object({
  ok: Type.Literal(true),
  now: Type.String({ format: 'date-time' }),
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
        response: {
          200: HealthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      return reply.code(200).send({
        ok: true,
        now: new Date().toISOString(),
      })
    },
  )
}

export default healthRoutes
