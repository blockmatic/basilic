import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getLastMagicLinkForTestAi } from './verification-helpers.js'

const MagicLinkLastResponseSchema = Type.Object({
  token: Type.Union([Type.String(), Type.Null()]),
  verificationId: Type.Union([Type.String(), Type.Null()]),
})

const QuerystringSchema = Type.Object({
  email: Type.Optional(Type.String()),
})

const magicLinkTestRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/last',
    {
      schema: {
        operationId: 'getLastMagicLinkToken',
        description: 'Get last magic link token from DB (test only, @test.ai)',
        summary: 'Get last magic link token',
        tags: ['test'],
        security: [],
        querystring: QuerystringSchema,
        response: {
          200: MagicLinkLastResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await getLastMagicLinkForTestAi({
        fastify,
        email: request.query.email,
      })
      return reply.code(200).send(result)
    },
  )
}

export default magicLinkTestRoute
export const prefixOverride = '/test/magic-link'
