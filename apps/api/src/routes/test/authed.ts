import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { ErrorResponseSchema } from '../schemas.js'

const AuthedResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    email: Type.Union([Type.String(), Type.Null()]),
  }),
})

const authedTestRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'testAuthed',
        description: 'Dummy authenticated endpoint for testing (requires Bearer token)',
        summary: 'Test authenticated endpoint',
        tags: ['test'],
        response: {
          200: AuthedResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      return reply.code(200).send({
        user: {
          id: request.session.user.id,
          email: request.session.user.email ?? null,
        },
      })
    },
  )
}

export default authedTestRoute
export const prefixOverride = '/test/authed'
