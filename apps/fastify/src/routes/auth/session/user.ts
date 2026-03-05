import { logger } from '@repo/utils/logger/server'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { users, walletIdentities } from '../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../schemas.js'

const LinkedWalletSchema = Type.Object({
  id: Type.String(),
  chain: Type.String(),
  address: Type.String(),
})

const UserResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    email: Type.Union([Type.String(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    emailVerified: Type.Union([Type.Boolean(), Type.Null()]),
    wallet: Type.Optional(Type.Object({ chain: Type.String(), address: Type.String() })),
    linkedWallets: Type.Array(LinkedWalletSchema),
  }),
})

const sessionUserRoute: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/user',
    {
      schema: {
        operationId: 'getUser',
        description: 'Get current user information',
        summary: 'Get user',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      const db = await getDb()
      const [user] = await db
        .select({ emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.id, request.session.user.id))
      if (!user?.emailVerified) {
        return reply.code(403).send({
          code: 'EMAIL_VERIFICATION_REQUIRED',
          message: 'Verify your email to continue',
        })
      }

      let linkedWallets: { id: string; chain: string; address: string }[]
      try {
        linkedWallets = await db
          .select({
            id: walletIdentities.id,
            chain: walletIdentities.chain,
            address: walletIdentities.address,
          })
          .from(walletIdentities)
          .where(eq(walletIdentities.userId, request.session.user.id))
      } catch (err) {
        logger.error({ err }, 'Failed to fetch linked wallets')
        return reply.code(500).send({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user data',
        })
      }

      return reply.code(200).send({
        user: {
          id: request.session.user.id,
          email: request.session.user.email,
          name: null,
          emailVerified: request.session.user.emailVerified ?? false,
          ...(request.session.user.wallet && { wallet: request.session.user.wallet }),
          linkedWallets,
        },
      })
    },
  )
}

export default sessionUserRoute
export const prefixOverride = '/auth/session'
