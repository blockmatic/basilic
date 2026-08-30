import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

// Request schemas
const CreateUserBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  name: Type.String({ minLength: 1 }),
})

const UserParamsSchema = Type.Object({
  id: Type.String(),
})

// Response schemas
const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
})

const ErrorSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
})

// Route definition
const userRoutes: FastifyPluginAsync = async fastify => {
  // GET /users/:id
  fastify.get(
    '/users/:id',
    {
      schema: {
        operationId: 'getUser',
        description: 'Get user by ID',
        tags: ['users'],
        params: UserParamsSchema,
        response: {
          200: UserSchema,
          404: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const user = await getUserById(id)

      if (!user) {
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return reply.send(user)
    },
  )

  // POST /users
  fastify.post(
    '/users',
    {
      schema: {
        operationId: 'createUser',
        description: 'Create a new user',
        tags: ['users'],
        body: CreateUserBodySchema,
        response: {
          201: UserSchema,
          400: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, name } = request.body
      const user = await createUser({ email, name })
      return reply.code(201).send(user)
    },
  )
}

export default userRoutes
