import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { ErrorResponseSchema } from '../../schemas.js'

const sessionLogoutRoute: FastifyPluginAsync = async fastify => {
  fastify.post(
    '/logout',
    {
      schema: {
        operationId: 'logout',
        description: 'Logout user and invalidate session',
        summary: 'Logout',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          204: Type.Null(),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })

      if (request.session.authKind === 'api-key')
        return sendCatalogError({ reply, status: 400, code: 'USE_KEY_REVOKE' })

      const db = await getDb()
      await db.delete(sessions).where(eq(sessions.id, request.session.session.id))

      return reply.code(204).send()
    },
  )
}

export default sessionLogoutRoute
export const prefixOverride = '/auth/session'
