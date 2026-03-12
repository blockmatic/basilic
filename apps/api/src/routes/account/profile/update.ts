import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, ne } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { users } from '../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../schemas.js'

const usernameRegex = /^[a-zA-Z0-9_-]{1,48}$/

const UpdateSchema = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 32 })),
  username: Type.Optional(
    Type.Union([
      Type.String({ minLength: 1, maxLength: 48, pattern: usernameRegex.source }),
      Type.Null(),
    ]),
  ),
})

const UpdateResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    email: Type.Union([Type.String(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    username: Type.Union([Type.String(), Type.Null()]),
  }),
})

const profileUpdateRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().patch(
    '/',
    {
      schema: {
        operationId: 'accountProfileUpdate',
        description: 'Update profile (name, username)',
        summary: 'Update profile',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: UpdateSchema,
        response: {
          200: UpdateResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const { name, username } = request.body
      const userId = request.session.user.id

      const updates: { name?: string | null; username?: string | null; updatedAt?: Date } = {
        updatedAt: new Date(),
      }
      if (name !== undefined) updates.name = name
      if (username !== undefined) updates.username = username === '' ? null : username

      if (name === undefined && username === undefined)
        return reply.code(200).send({
          user: {
            id: userId,
            email: request.session.user.email ?? null,
            name: request.session.user.name ?? null,
            username: request.session.user.username ?? null,
          },
        })

      const db = await getDb()

      if (username !== undefined && username !== null && username !== '') {
        const [existing] = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.username, username), ne(users.id, userId)))
        if (existing)
          return reply.code(409).send({
            code: 'USERNAME_TAKEN',
            message: 'Username is already in use',
          })
      }

      try {
        const [row] = await db.update(users).set(updates).where(eq(users.id, userId)).returning()

        if (!row) throw new Error('Failed to update profile')

        return reply.code(200).send({
          user: {
            id: row.id,
            email: row.email ?? null,
            name: row.name ?? null,
            username: row.username ?? null,
          },
        })
      } catch (err) {
        const code =
          (err as { cause?: { code?: string }; code?: string }).cause?.code ??
          (err as { code?: string }).code
        if (code === '23505')
          return reply.code(409).send({
            code: 'USERNAME_TAKEN',
            message: 'Username is already in use',
          })
        throw err
      }
    },
  )
}

export default profileUpdateRoute
export const prefixOverride = '/account/profile'
