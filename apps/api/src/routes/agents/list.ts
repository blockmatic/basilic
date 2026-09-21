import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { AgentRecordSchema, agentCatalog } from '../../lib/agents-registry.js'
import { sendCatalogError } from '../../lib/catalogs/mapper.js'
import { env } from '../../lib/env.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../schemas.js'

const agentsListRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'listAgents',
        description:
          'List product eve agents (command, chat). JWT required. Endpoints are absolute eve origins.',
        summary: 'List agents',
        tags: ['agents'],
        security: [{ bearerAuth: [] }],
        response: {
          200: Type.Array(AgentRecordSchema),
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      return reply
        .code(200)
        .send(agentCatalog({ commandUrl: env.EVE_COMMAND_URL, chatUrl: env.EVE_CHAT_URL }))
    },
  )
}

export default agentsListRoute
export const prefixOverride = '/agents'
