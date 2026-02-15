import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { apiKeys } from '../../../db/schema/index.js'
import { generateApiKey } from '../../../lib/api-keys.js'
import { ErrorResponseSchema } from '../../schemas.js'

const CreateSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 64 }),
})

const CreateResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  key: Type.String(),
  prefix: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
})

const apikeysCreateRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/',
    {
      schema: {
        operationId: 'accountApikeysCreate',
        description: 'Create API key (shown once)',
        summary: 'Create API key',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: CreateSchema,
        response: {
          200: CreateResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })
      }

      const { name } = request.body
      const { key, prefix, hash } = generateApiKey()
      const id = randomUUID()

      const db = await getDb()
      const [row] = await db
        .insert(apiKeys)
        .values({
          id,
          userId: request.session.user.id,
          name,
          prefix,
          hash,
        })
        .returning()

      if (!row) throw new Error('Failed to create API key')

      return reply.code(200).send({
        id: row.id,
        name: row.name,
        key,
        prefix: row.prefix,
        createdAt: row.createdAt.toISOString(),
      })
    },
  )
}

export default apikeysCreateRoute
export const prefixOverride = '/account/apikeys'
