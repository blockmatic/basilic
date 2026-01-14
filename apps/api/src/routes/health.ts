import type { FastifyPluginAsync } from 'fastify'

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
          200: {
            description: 'Health check response',
            type: 'object',
            properties: {
              ok: {
                type: 'boolean',
                enum: [true],
              },
              now: {
                type: 'string',
                format: 'date-time',
              },
            },
            required: ['ok', 'now'],
          },
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
