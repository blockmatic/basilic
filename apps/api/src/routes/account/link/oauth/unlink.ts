import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { account } from '../../../../db/schema/index.js'
import { hasRemainingLoginMethod, withUserSignInMethodLock } from '../../../../lib/auth/index.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const UnlinkParamsSchema = Type.Object({
  providerId: Type.Union([
    Type.Literal('github'),
    Type.Literal('facebook'),
    Type.Literal('twitter'),
    Type.Literal('google'),
  ]),
})

const oauthUnlinkRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/:providerId',
    {
      schema: {
        operationId: 'accountLinkOauthUnlink',
        description: 'Unlink OAuth provider from authenticated user',
        summary: 'OAuth unlink',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        params: UnlinkParamsSchema,
        response: {
          204: Type.Null(),
          400: ErrorResponseSchema,
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

      const { providerId } = request.params
      const userId = request.session.user.id
      const db = await getDb()

      const result = await withUserSignInMethodLock(db, userId, async tx => {
        const [accountRow] = await tx
          .select()
          .from(account)
          .where(and(eq(account.userId, userId), eq(account.providerId, providerId)))

        if (!accountRow) return { status: 'not_linked' as const }

        const wouldHaveRemaining = await hasRemainingLoginMethod(tx, userId, {
          excludeProviderId: providerId,
        })
        if (!wouldHaveRemaining) return { status: 'last_method' as const }

        await tx.delete(account).where(eq(account.id, accountRow.id))
        return { status: 'ok' as const }
      })

      if (result.status === 'not_linked')
        return reply.code(400).send({
          code: 'NOT_LINKED',
          message: 'This provider is not linked to your account',
        })

      if (result.status === 'last_method')
        return reply.code(400).send({
          code: 'LAST_SIGN_IN_METHOD',
          message: 'Cannot unlink the last sign-in method. Add another before unlinking.',
        })

      return reply.code(204).send(null)
    },
  )
}

export default oauthUnlinkRoute
export const prefixOverride = '/account/link/oauth'
