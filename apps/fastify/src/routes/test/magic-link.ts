import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '@/lib/env.js'

const MagicLinkTokenResponseSchema = Type.Object({
  token: Type.Union([Type.String(), Type.Null()]),
})

const magicLinkTestRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/last',
    {
      schema: {
        operationId: 'getLastMagicLinkToken',
        description: 'Get last magic link token from fake email provider (test only)',
        summary: 'Get last magic link token',
        tags: ['test'],
        security: [],
        response: {
          200: MagicLinkTokenResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      // Only available when USE_FAKE_EMAIL is enabled
      // Return null token if not in test mode (rather than 404 to keep response schema consistent)
      if (!env.USE_FAKE_EMAIL) {
        return reply.code(200).send({ token: null })
      }

      // Check if fakeEmail is available
      if (!fastify.fakeEmail) {
        return reply.code(200).send({ token: null })
      }

      const token = fastify.fakeEmail.extractToken()
      return reply.code(200).send({ token })
    },
  )
}

export default magicLinkTestRoute
export const prefixOverride = '/test/magic-link'
