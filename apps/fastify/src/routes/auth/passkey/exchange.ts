import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, gt } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { decryptPasskeyTokens } from '../../../db/passkey-callback.js'
import { passkeyCallback } from '../../../db/schema/index.js'
import { hashToken } from '../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../schemas.js'

const ExchangeSchema = Type.Object({
  code: Type.String(),
  origin: Type.Optional(Type.String()),
})

const ExchangeResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const passkeyExchangeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/exchange',
    {
      schema: {
        operationId: 'authPasskeyExchange',
        description: 'Exchange one-time code for tokens (passkey redirect flow)',
        summary: 'Exchange passkey code for tokens',
        tags: ['auth'],
        security: [],
        body: ExchangeSchema,
        response: {
          200: ExchangeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { code, origin: bodyOrigin } = request.body

      if (!code?.trim())
        return reply.code(400).send({
          code: 'MISSING_CODE',
          message: 'code is required',
        })

      const requestOrigin = (bodyOrigin ?? request.headers.origin)?.trim()

      const codeHash = hashToken(code.trim())
      const db = await getDb()
      const now = new Date()

      const [row] = await db
        .delete(passkeyCallback)
        .where(and(eq(passkeyCallback.codeHash, codeHash), gt(passkeyCallback.expiresAt, now)))
        .returning()

      if (!row)
        return reply.code(401).send({
          code: 'INVALID_OR_EXPIRED_CODE',
          message: 'Invalid or expired code',
        })

      if (row.callbackOrigin) {
        if (!requestOrigin)
          return reply.code(400).send({
            code: 'MISSING_ORIGIN',
            message: 'Origin is required for code exchange (pass in body or Origin header)',
          })
        if (row.callbackOrigin !== requestOrigin)
          return reply.code(401).send({
            code: 'ORIGIN_MISMATCH',
            message: 'Request origin does not match callback origin',
          })
      }

      const decrypted = decryptPasskeyTokens(row)
      return reply.code(200).send({
        token: decrypted.accessToken,
        refreshToken: decrypted.refreshToken,
      })
    },
  )
}

export default passkeyExchangeRoute
export const prefixOverride = '/auth/passkey'
