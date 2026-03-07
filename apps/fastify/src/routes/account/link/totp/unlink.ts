import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { totp } from '../../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const totpUnlinkRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/',
    {
      schema: {
        operationId: 'accountLinkTotpUnlink',
        description: 'Remove TOTP authenticator',
        summary: 'TOTP unlink',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
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

      const userId = request.session.user.id
      const db = await getDb()

      const deleted = await db.delete(totp).where(eq(totp.userId, userId)).returning()

      if (deleted.length === 0)
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'No TOTP configured',
        })

      return reply.code(204).send(null)
    },
  )
}

export default totpUnlinkRoute
export const prefixOverride = '/account/link/totp'
