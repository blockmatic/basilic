import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { apiKeys } from '../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../schemas.js'

function toApiKeyItem(row: {
  id: string
  name: string
  prefix: string
  lastUsedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
}) {
  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

const ApiKeyItemSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  prefix: Type.String(),
  lastUsedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  expiresAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  createdAt: Type.String({ format: 'date-time' }),
})

const ListResponseSchema = Type.Object({
  keys: Type.Array(ApiKeyItemSchema, { maxItems: 50 }),
})

const apikeysListRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'accountApikeysList',
        description: 'List API keys for authenticated user',
        summary: 'List API keys',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        response: {
          200: ListResponseSchema,
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

      const db = await getDb()
      const rows = await db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          prefix: apiKeys.prefix,
          lastUsedAt: apiKeys.lastUsedAt,
          expiresAt: apiKeys.expiresAt,
          createdAt: apiKeys.createdAt,
        })
        .from(apiKeys)
        .where(eq(apiKeys.userId, request.session.user.id))

      return reply.code(200).send({ keys: rows.map(toApiKeyItem) })
    },
  )
}

export default apikeysListRoute
export const prefixOverride = '/account/apikeys'
