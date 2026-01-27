import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../schemas.js'

const LogoutResponseSchema = Type.Object({
  ok: Type.Boolean(),
})

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
          200: LogoutResponseSchema,
          204: Type.Null(),
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // Session is already attached by auth plugin
      if (!request.session) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      const db = await getDb()

      // Revoke session
      await db.delete(sessions).where(eq(sessions.id, request.session.session.id))

      return reply.code(204).send()
    },
  )
}

export default sessionLogoutRoute
export const prefixOverride = '/auth/session'
