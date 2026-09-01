import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { walletIdentities } from '../../../../db/schema/index.js'
import { hasRemainingLoginMethod } from '../../../../lib/auth-guardrails.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const unlinkRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/:id',
    {
      schema: {
        operationId: 'accountLinkWalletUnlink',
        description: 'Unlink wallet from authenticated user',
        summary: 'Unlink wallet',
        tags: ['account'],
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
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })

      const { id } = request.params
      const userId = request.session.user.id
      const db = await getDb()

      const [walletRow] = await db
        .select({ id: walletIdentities.id })
        .from(walletIdentities)
        .where(and(eq(walletIdentities.id, id), eq(walletIdentities.userId, userId)))

      if (!walletRow)
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Wallet not found',
        })

      const wouldHaveRemaining = await hasRemainingLoginMethod(db, userId, { excludeWalletId: id })
      if (!wouldHaveRemaining)
        return reply.code(400).send({
          code: 'LAST_SIGN_IN_METHOD',
          message: 'Cannot unlink the last sign-in method. Add another before unlinking.',
        })

      const deleted = await db
        .delete(walletIdentities)
        .where(and(eq(walletIdentities.id, id), eq(walletIdentities.userId, userId)))
        .returning()

      if (deleted.length === 0)
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Wallet not found',
        })

      return reply.code(204).send(null)
    },
  )
}

export default unlinkRoute
export const prefixOverride = '/account/link/wallet'
