import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { passkeyCredentials, users } from '../../../db/schema/index.js'
import { env } from '../../../lib/env.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

const ResolveUserBodySchema = Type.Object({
  userHandle: Type.String({ pattern: '^[A-Za-z0-9_-]+(={0,2})?$', minLength: 1 }),
})

function maskEmail(email: string): string {
  const at = email.indexOf('@')
  if (at <= 0) return '***@***'
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const maskedLocal = local.length <= 2 ? '***' : `${local[0]}***`
  const dot = domain.lastIndexOf('.')
  const domainName = dot > 0 ? domain.slice(0, dot) : domain
  const maskedDomain = domainName.length <= 2 ? '***' : `${domainName[0]}***${domainName.slice(-1)}`
  const tld = dot > 0 ? domain.slice(dot) : ''
  return `${maskedLocal}@${maskedDomain}${tld}`
}

const ResolveUserResponseSchema = Type.Object({
  maskedIdentifier: Type.String(),
})

const passkeyResolveUserRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/resolve-user',
    {
      config: {
        rateLimit: { max: 10, timeWindow: env.RATE_LIMIT_TIME_WINDOW },
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
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { userHandle } = request.body

      const bytes = Buffer.from(userHandle.trim(), 'base64url')
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

      return reply.code(200).send({ maskedIdentifier: maskEmail(row.email) })
    },
  )
}

export default passkeyResolveUserRoute
export const prefixOverride = '/auth/passkey'
