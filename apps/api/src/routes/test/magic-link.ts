import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { assertTestRoutesEnabled } from './assert-test-routes-enabled.js'
import { getLastMagicLinkForTestAi, isTestEmailAllowed } from './verification-helpers.js'

const MagicLinkLastResponseSchema = Type.Object({
  token: Type.Union([Type.String(), Type.Null()]),
  verificationId: Type.Union([Type.String(), Type.Null()]),
})

const QuerystringSchema = Type.Object({
  email: Type.String(),
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
          400: Type.Object({ code: Type.String(), message: Type.String() }),
          404: Type.Object({ code: Type.String(), message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      if (!assertTestRoutesEnabled(reply)) return

      const { email } = request.query
      if (!isTestEmailAllowed(email))
        return reply.code(400).send({
          code: 'INVALID_INPUT',
          message: 'email must be a @test.ai address',
        })

      const result = await getLastMagicLinkForTestAi({ fastify, email })
      return reply.code(200).send(result)
    },
  )
}

export default magicLinkTestRoute
export const prefixOverride = '/test/magic-link'
