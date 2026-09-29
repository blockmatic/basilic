import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { AgentRecordSchema, agentCatalog } from '../../lib/agents-registry.js'
import { env } from '../../lib/env.js'
import { RateLimitResponseSchema } from '../schemas.js'

const agentsListRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'listAgents',
        description:
          'List product eve agents (command, chat). Public host discovery. Endpoints are absolute eve origins.',
        summary: 'List agents',
        tags: ['agents'],
        security: [],
        response: {
          200: Type.Array(AgentRecordSchema),
          429: RateLimitResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      return reply
        .code(200)
        .send(agentCatalog({ commandUrl: env.EVE_COMMAND_URL, chatUrl: env.EVE_CHAT_URL }))
    },
  )
}

export default agentsListRoute
export const prefixOverride = '/agents'
