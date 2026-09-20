import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { getDb } from '@repo/db'
import { apiKeys } from '@repo/db/schema'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { ErrorResponseSchema } from '../../schemas.js'

const apikeysRevokeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/:id',
    {
      schema: {
        operationId: 'accountApikeysRevoke',
        description: 'Revoke API key',
        summary: 'Revoke API key',
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
        .delete(apiKeys)
        .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, request.session.user.id)))
        .returning()

      if (deleted.length === 0)
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'API key not found',
        })

      return reply.code(204).send(null)
    },
  )
}

export default apikeysRevokeRoute
export const prefixOverride = '/account/apikeys'
