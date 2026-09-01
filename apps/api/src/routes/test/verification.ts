import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import {
  getLastVerification,
  isAllowedTestType,
  isTestEmailAllowed,
} from './verification-helpers.js'

const VerificationLastResponseSchema = Type.Object({
  token: Type.Union([Type.String(), Type.Null()]),
  verificationId: Type.Union([Type.String(), Type.Null()]),
})

const QuerystringSchema = Type.Object({
  type: Type.String(),
  email: Type.String(),
})

const verificationTestRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/last',
    {
      schema: {
        operationId: 'getLastVerificationToken',
        description: 'Get last verification token from DB (test only, @test.ai)',
        summary: 'Get last verification token',
        tags: ['test'],
        security: [],
        querystring: QuerystringSchema,
        response: {
          200: VerificationLastResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { type, email } = request.query
      if (!isAllowedTestType(type) || !isTestEmailAllowed(email))
        return reply.code(200).send({ token: null, verificationId: null })

      const result = await getLastVerification({ fastify, type, email })
      return reply.code(200).send(result)
    },
  )
}

export default verificationTestRoute
export const prefixOverride = '/test/verification'
