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
        },
      },
    },
    async (request, reply) => {
      const { userHandle } = request.body

      const trimmed = userHandle.trim()
      if (!trimmed)
        return reply.code(400).send({
          code: 'INVALID_USER_HANDLE',
          message: 'Invalid userHandle encoding',
        })

      if (!/^[A-Za-z0-9_-]+(={0,2})?$/.test(trimmed))
        return reply.code(400).send({
          code: 'INVALID_USER_HANDLE',
          message: 'Invalid userHandle encoding',
        })

      const bytes = Buffer.from(trimmed, 'base64url')
      const userId = bytes.toString('utf-8')
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
        return reply.code(400).send({
          code: 'INVALID_USER_HANDLE',
          message: 'Invalid userHandle encoding',
        })

      return reply.code(200).send({ email: row.email })
    },
  )
}

export default passkeyResolveUserRoute
export const prefixOverride = '/auth/passkey'
