import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, gt } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { decryptCallbackTokens } from '../../../db/callback-tokens.js'
import { getDb } from '../../../db/index.js'
import { web3Callback } from '../../../db/schema/index.js'
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

const web3ExchangeRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/exchange',
    {
      schema: {
        operationId: 'web3Exchange',
        description: 'Exchange one-time code for tokens (redirect flow)',
        summary: 'Exchange code for tokens',
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

      const codeHash = hashToken(code.trim())
      const db = await getDb()
      const now = new Date()

      const [row] = await db
        .delete(web3Callback)
        .where(and(eq(web3Callback.codeHash, codeHash), gt(web3Callback.expiresAt, now)))
        .returning()

      if (!row) return sendCatalogError({ reply, status: 401, code: 'INVALID_OR_EXPIRED_CODE' })

      const tokens = decryptCallbackTokens(row)
      if (!tokens) return sendCatalogError({ reply, status: 401, code: 'INVALID_OR_EXPIRED_CODE' })

      return reply.code(200).send({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    },
  )
}

export default web3ExchangeRoute
export const prefixOverride = '/auth/web3'
