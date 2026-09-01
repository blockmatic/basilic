import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, gt } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { decryptCallbackTokens } from '../../../db/callback-tokens.js'
import { getDb } from '../../../db/index.js'
import { passkeyCallback } from '../../../db/schema/index.js'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { hashToken } from '../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../schemas.js'

const ExchangeSchema = Type.Object({
  code: Type.String(),
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
      const { code } = request.body

      if (!code?.trim()) return sendCatalogError({ reply, status: 400, code: 'MISSING_CODE' })

      const rawOrigin = request.headers['x-callback-origin'] ?? request.headers.origin
      const requestOrigin =
        (typeof rawOrigin === 'string' ? rawOrigin : rawOrigin?.[0])?.trim() ?? ''

      const codeHash = hashToken(code.trim())
      const db = await getDb()
      const now = new Date()

      try {
        const row = await db.transaction(async tx => {
          const [r] = await tx
            .select()
            .from(passkeyCallback)
            .where(and(eq(passkeyCallback.codeHash, codeHash), gt(passkeyCallback.expiresAt, now)))
            .limit(1)
          if (!r) return null
          if (r.callbackOrigin) {
            if (!requestOrigin) throw new Error('MISSING_ORIGIN')
            if (r.callbackOrigin !== requestOrigin) throw new Error('ORIGIN_MISMATCH')
          }
          const [deleted] = await tx
            .delete(passkeyCallback)
            .where(and(eq(passkeyCallback.codeHash, codeHash), eq(passkeyCallback.id, r.id)))
            .returning()
          return deleted ?? null
        })

        if (!row) return sendCatalogError({ reply, status: 401, code: 'INVALID_OR_EXPIRED_CODE' })

        const decrypted = decryptCallbackTokens(row)
        if (!decrypted)
          return sendCatalogError({ reply, status: 401, code: 'INVALID_OR_EXPIRED_CODE' })

        return reply.code(200).send({
          token: decrypted.accessToken,
          refreshToken: decrypted.refreshToken,
        })
      } catch (err) {
        if (err instanceof Error && err.message === 'MISSING_ORIGIN')
          return reply.code(400).send({
            code: 'MISSING_ORIGIN',
            message: 'Origin is required for code exchange (Origin or X-Callback-Origin header)',
          })
        if (err instanceof Error && err.message === 'ORIGIN_MISMATCH')
          return reply.code(401).send({
            code: 'ORIGIN_MISMATCH',
            message: 'Request origin does not match callback origin',
          })
        throw err
      }
    },
  )
}

export default passkeyExchangeRoute
export const prefixOverride = '/auth/passkey'
