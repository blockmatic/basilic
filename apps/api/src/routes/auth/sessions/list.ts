import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, desc, eq, gt } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { sessions } from '../../../db/schema/index.js'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { ErrorResponseSchema } from '../../schemas.js'

const SessionItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  signInMethod: Type.Union([Type.String(), Type.Null()]),
  deviceLabel: Type.Union([Type.String(), Type.Null()]),
  location: Type.Union([Type.String(), Type.Null()]),
  ipAddress: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: 'date-time' }),
  isCurrent: Type.Boolean(),
})

const ListResponseSchema = Type.Object({
  sessions: Type.Array(SessionItemSchema),
})

const sessionsListRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'authSessionsList',
        description: 'List non-expired sessions for the authenticated user',
        summary: 'List sessions',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: ListResponseSchema,
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
      const rows = await db
        .select({
          id: sessions.id,
          signInMethod: sessions.signInMethod,
          deviceLabel: sessions.deviceLabel,
          location: sessions.location,
          ipAddress: sessions.ipAddress,
          createdAt: sessions.createdAt,
        })
        .from(sessions)
        .where(
          and(eq(sessions.userId, request.session.user.id), gt(sessions.expiresAt, new Date())),
        )
        .orderBy(desc(sessions.createdAt))

      const currentId = request.session.session.id
      return reply.code(200).send({
        sessions: rows.map(row => ({
          id: row.id,
          signInMethod: row.signInMethod,
          deviceLabel: row.deviceLabel,
          location: row.location,
          ipAddress: row.ipAddress,
          createdAt: row.createdAt.toISOString(),
          isCurrent: row.id === currentId,
        })),
      })
    },
  )
}

export default sessionsListRoute
export const prefixOverride = '/auth/sessions'
