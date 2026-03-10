import { logger } from '@repo/utils/logger/server'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { passkeyCredentials, totp, users, walletIdentities } from '../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../schemas.js'

const LinkedWalletSchema = Type.Object({
  id: Type.String(),
  chain: Type.String(),
  address: Type.String(),
})

const PasskeySchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
})

const UserResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    email: Type.Union([Type.String(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    username: Type.Union([Type.String(), Type.Null()]),
    emailVerified: Type.Union([Type.Boolean(), Type.Null()]),
    wallet: Type.Optional(Type.Object({ chain: Type.String(), address: Type.String() })),
    linkedWallets: Type.Array(LinkedWalletSchema),
    totpEnabled: Type.Boolean(),
    passkeys: Type.Array(PasskeySchema),
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
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })

      const userId = request.session.user.id
      let linkedWallets: { id: string; chain: string; address: string }[] = []
      let totpEnabled = false
      let passkeys: { id: string; name: string; createdAt: string }[] = []
      let userRow: { name?: string | null; username?: string | null } | undefined

      try {
        const db = await getDb()
        linkedWallets = await db
          .select({
            id: walletIdentities.id,
            chain: walletIdentities.chain,
            address: walletIdentities.address,
          })
          .from(walletIdentities)
          .where(eq(walletIdentities.userId, userId))

        const [totpRow] = await db.select().from(totp).where(eq(totp.userId, userId))
        totpEnabled = !!totpRow

        const passkeyRows = await db
          .select({
            id: passkeyCredentials.id,
            name: passkeyCredentials.name,
            createdAt: passkeyCredentials.createdAt,
          })
          .from(passkeyCredentials)
          .where(eq(passkeyCredentials.userId, userId))
        passkeys = passkeyRows.map(p => ({
          id: p.id,
          name: p.name,
          createdAt: p.createdAt.toISOString(),
        }))

        ;[userRow] = await db.select().from(users).where(eq(users.id, userId))
      } catch (err) {
        logger.error({ err }, 'Failed to fetch user data')
        return reply.code(500).send({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user data',
        })
      }

      return reply.code(200).send({
        user: {
          id: request.session.user.id,
          email: request.session.user.email,
          name: userRow?.name ?? request.session.user.name ?? null,
          username: userRow?.username ?? request.session.user.username ?? null,
          emailVerified: null,
          ...(request.session.user.wallet && { wallet: request.session.user.wallet }),
          linkedWallets,
          totpEnabled,
          passkeys,
        },
      })
    },
  )
}

export default sessionUserRoute
export const prefixOverride = '/auth/session'
