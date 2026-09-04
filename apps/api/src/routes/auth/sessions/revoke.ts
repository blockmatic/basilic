import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { authLoginRouteConfig } from '../../../lib/auth/index.js'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { consumeSessionRevokeToken } from '../../../lib/session/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

const RevokeBodySchema = Type.Object({
  token: Type.String(),
  verificationId: Type.String({ format: 'uuid' }),
})

const RevokeResponseSchema = Type.Object({
  ok: Type.Literal(true),
})

const sessionsRevokeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/revoke',
    {
      config: authLoginRouteConfig,
      schema: {
        operationId: 'authSessionsRevoke',
        description: 'Revoke a session using a one-time email token',
        summary: 'Revoke session by token',
        tags: ['auth'],
        security: [],
        body: RevokeBodySchema,
        response: {
          200: RevokeResponseSchema,
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { token, verificationId } = request.body
      const db = await getDb()
      const result = await consumeSessionRevokeToken({ db, token, verificationId })
      if (result === 'invalid')
        return sendCatalogError({ reply, status: 401, code: 'INVALID_TOKEN' })
      if (result === 'expired')
        return sendCatalogError({ reply, status: 401, code: 'EXPIRED_TOKEN' })
      return reply.code(200).send({ ok: true })
    },
  )
}

export default sessionsRevokeRoute
export const prefixOverride = '/auth/sessions'
