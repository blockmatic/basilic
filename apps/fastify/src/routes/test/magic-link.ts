import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, desc, isNotNull, like } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../db/index.js'
import { verification } from '../../db/schema/index.js'
import { env } from '../../lib/env.js'

const MagicLinkTokenResponseSchema = Type.Object({
  token: Type.Union([Type.String(), Type.Null()]),
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
        response: {
          200: MagicLinkTokenResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!env.ALLOW_TEST || env.NODE_ENV === 'production')
        return reply.code(200).send({ token: null })

      const db = await getDb()
      const [row] = await db
        .select({ tokenPlain: verification.tokenPlain })
        .from(verification)
        .where(and(like(verification.identifier, '%@test.ai'), isNotNull(verification.tokenPlain)))
        .orderBy(desc(verification.createdAt))
        .limit(1)

      const fromDb = row?.tokenPlain ?? null
      if (fromDb) return reply.code(200).send({ token: fromDb })

      const fromFake = request.server.fakeEmail?.extractToken()
      return reply.code(200).send({ token: fromFake ?? null })
    },
  )
}

export default magicLinkTestRoute
export const prefixOverride = '/test/magic-link'
