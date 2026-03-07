import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { passkeyCredentials } from '../../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const passkeyDeleteRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/:id',
    {
      schema: {
        operationId: 'accountLinkPasskeyDelete',
        description: 'Remove passkey by id',
        summary: 'Remove passkey',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
        response: {
          204: Type.Null(),
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const { id } = request.params
      const db = await getDb()

      const deleted = await db
        .delete(passkeyCredentials)
        .where(
          and(
            eq(passkeyCredentials.id, id),
            eq(passkeyCredentials.userId, request.session.user.id),
          ),
        )
        .returning()

      if (deleted.length === 0)
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Passkey not found',
        })

      return reply.code(204).send(null)
    },
  )
}

export default passkeyDeleteRoute
export const prefixOverride = '/account/link/passkey'
