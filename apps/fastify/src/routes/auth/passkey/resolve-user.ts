import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { passkeyCredentials, users } from '../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../schemas.js'

const ResolveUserBodySchema = Type.Object({
  userHandle: Type.String(),
})

const ResolveUserResponseSchema = Type.Object({
  email: Type.String(),
})

const passkeyResolveUserRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/resolve-user',
    {
      config: {
        rateLimit: { max: 10, timeWindow: 60_000 },
      },
      schema: {
        operationId: 'authPasskeyResolveUser',
        description: 'Resolve user email from passkey assertion userHandle (for discovery UX)',
        summary: 'Passkey resolve user',
        tags: ['auth'],
        security: [],
        body: ResolveUserBodySchema,
        response: {
          200: ResolveUserResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { userHandle } = request.body

      let userId: string
      try {
        const bytes = Buffer.from(userHandle, 'base64url')
        userId = bytes.toString('utf-8')
      } catch {
        return reply.code(400).send({
          code: 'INVALID_USER_HANDLE',
          message: 'Invalid userHandle encoding',
        })
      }

      if (!userId?.trim())
        return reply.code(400).send({
          code: 'INVALID_USER_HANDLE',
          message: 'Empty userHandle after decode',
        })

      const db = await getDb()
      const [row] = await db
        .select({ email: users.email })
        .from(users)
        .innerJoin(passkeyCredentials, eq(passkeyCredentials.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1)

      if (!row?.email)
        return reply.code(404).send({
          code: 'USER_NOT_FOUND',
          message: 'User not found or has no passkey',
        })

      return reply.code(200).send({ email: row.email })
    },
  )
}

export default passkeyResolveUserRoute
export const prefixOverride = '/auth/passkey'
