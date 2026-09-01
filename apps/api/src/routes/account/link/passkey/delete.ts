import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { passkeyCredentials } from '../../../../db/schema/index.js'
import {
  hasRemainingLoginMethod,
  withUserSignInMethodLock,
} from '../../../../lib/auth-guardrails.js'
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

      const result = await withUserSignInMethodLock(db, userId, async tx => {
        const [passkeyRow] = await tx
          .select({ id: passkeyCredentials.id })
          .from(passkeyCredentials)
          .where(and(eq(passkeyCredentials.id, id), eq(passkeyCredentials.userId, userId)))

        if (!passkeyRow) return { status: 404 as const }

        const wouldHaveRemaining = await hasRemainingLoginMethod(tx, userId, {
          excludePasskeyId: id,
        })
        if (!wouldHaveRemaining) return { status: 400 as const }

        const deleted = await tx
          .delete(passkeyCredentials)
          .where(and(eq(passkeyCredentials.id, id), eq(passkeyCredentials.userId, userId)))
          .returning()

        if (deleted.length === 0) return { status: 404 as const }

        return { status: 204 as const }
      })

      if (result.status === 404)
        return reply.code(404).send({
          code: 'NOT_FOUND',
          message: 'Passkey not found',
        })

      if (result.status === 400)
        return reply.code(400).send({
          code: 'LAST_SIGN_IN_METHOD',
          message: 'Cannot unlink the last sign-in method. Add another before unlinking.',
        })

      return reply.code(204).send(null)
    },
  )
}

export default passkeyDeleteRoute
export const prefixOverride = '/account/link/passkey'
