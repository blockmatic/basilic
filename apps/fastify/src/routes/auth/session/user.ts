import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { ErrorResponseSchema } from '../../schemas.js'

const UserResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    email: Type.Union([Type.String(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    emailVerified: Type.Union([Type.Boolean(), Type.Null()]),
  }),
})

const sessionUserRoute: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/user',
    {
      schema: {
        operationId: 'getUser',
        description: 'Get current user information',
        summary: 'Get user',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      return reply.code(200).send({
        user: {
          id: request.session.user.id,
          email: request.session.user.email,
          name: null,
          emailVerified: null,
        },
      })
    },
  )
}

export default sessionUserRoute
export const prefixOverride = '/auth/session'
