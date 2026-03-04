import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq, gt } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../db/index.js'
import { web3Callback } from '../../../db/schema/index.js'
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

      if (!code?.trim()) {
        return reply.code(400).send({
          code: 'MISSING_CODE',
          message: 'code is required',
        })
      }

      const codeHash = hashToken(code.trim())
      const db = await getDb()
      const now = new Date()

      const row = await db
        .select()
        .from(web3Callback)
        .where(and(eq(web3Callback.codeHash, codeHash), gt(web3Callback.expiresAt, now)))
        .limit(1)
        .then(rows => rows[0] ?? null)

      if (!row) {
        return reply.code(401).send({
          code: 'INVALID_OR_EXPIRED_CODE',
          message: 'Invalid or expired code',
        })
      }

      await db.delete(web3Callback).where(eq(web3Callback.id, row.id))

      return reply.code(200).send({
        token: row.accessToken,
        refreshToken: row.refreshToken,
      })
    },
  )
}

export default web3ExchangeRoute
export const prefixOverride = '/auth/web3'
