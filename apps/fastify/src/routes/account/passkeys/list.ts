import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { passkeyCredentials } from '../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../schemas.js'

const PasskeyItemSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
})

const ListResponseSchema = Type.Object({
  passkeys: Type.Array(PasskeyItemSchema),
})

const passkeysListRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'accountPasskeysList',
        description: 'List passkeys for authenticated user',
        summary: 'List passkeys',
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
          id: passkeyCredentials.id,
          name: passkeyCredentials.name,
          createdAt: passkeyCredentials.createdAt,
        })
        .from(passkeyCredentials)
        .where(eq(passkeyCredentials.userId, request.session.user.id))

      return reply.code(200).send({
        passkeys: rows.map(r => ({
          id: r.id,
          name: r.name,
          createdAt: r.createdAt.toISOString(),
        })),
      })
    },
  )
}

export default passkeysListRoute
export const prefixOverride = '/account/passkeys'
