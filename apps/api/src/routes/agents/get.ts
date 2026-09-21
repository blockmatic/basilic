import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { AgentRecordSchema, agentById } from '../../lib/agents-registry.js'
import { sendCatalogError } from '../../lib/catalogs/mapper.js'
import { env } from '../../lib/env.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../schemas.js'

const AgentIdParamsSchema = Type.Object({
  agentId: Type.String({ minLength: 1 }),
})

const agentsGetRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/:agentId',
    {
      schema: {
        operationId: 'getAgentById',
        description: 'Get one product eve agent by id (command or chat). JWT required.',
        summary: 'Get agent',
        tags: ['agents'],
        security: [{ bearerAuth: [] }],
        params: AgentIdParamsSchema,
        response: {
          200: AgentRecordSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      const row = agentById({
        agentId: request.params.agentId,
        commandUrl: env.EVE_COMMAND_URL,
        chatUrl: env.EVE_CHAT_URL,
      })
      if (!row) return sendCatalogError({ reply, status: 404, code: 'NOT_FOUND' })
      return reply.code(200).send(row)
    },
  )
}

export default agentsGetRoute
export const prefixOverride = '/agents'
