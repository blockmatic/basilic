import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { ErrorResponseSchema } from '../../schemas.js'

const sessionsDeleteRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/:id',
    {
      schema: {
        operationId: 'authSessionsDelete',
        description: 'Revoke one of the authenticated user’s sessions',
        summary: 'Delete session',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
        response: {
          204: Type.Null(),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      if (request.session.authKind === 'api-key')
        return sendCatalogError({ reply, status: 400, code: 'USE_KEY_REVOKE' })

      const { id } = request.params
      const db = await getDb()
      const deleted = await db
        .delete(sessions)
        .where(and(eq(sessions.id, id), eq(sessions.userId, request.session.user.id)))
        .returning()

      if (deleted.length === 0) return sendCatalogError({ reply, status: 404, code: 'NOT_FOUND' })
      return reply.code(204).send(null)
    },
  )
}

export default sessionsDeleteRoute
export const prefixOverride = '/auth/sessions'
