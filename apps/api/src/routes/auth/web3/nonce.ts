import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getAddress } from 'viem'
import { generateSiweNonce } from 'viem/siwe'
import { getDb } from '../../../db/index.js'
import { web3Nonce } from '../../../db/schema/index.js'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { ErrorResponseSchema } from '../../schemas.js'

const nonceExpiryMinutes = 5

const NonceResponseSchema = Type.Object({
  nonce: Type.String(),
})

const web3NonceRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get<{
    Querystring: { chain: 'eip155' | 'solana'; address: string }
  }>(
    '/nonce',
    {
      schema: {
        operationId: 'web3Nonce',
        description: 'Get nonce for wallet sign-in or account linking',
        summary: 'Get nonce',
        tags: ['auth'],
        security: [],
        querystring: Type.Object({
          chain: Type.Union([Type.Literal('eip155'), Type.Literal('solana')]),
          address: Type.String(),
        }),
        response: {
          200: NonceResponseSchema,
          400: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { chain, address } = request.query

      let normalizedAddr: string
      try {
        normalizedAddr =
          chain === 'eip155' ? getAddress(address.trim()).toLowerCase() : address.trim()
      } catch {
        return sendCatalogError({ reply, status: 400, code: 'INVALID_ADDRESS' })
      }

      const nonce = generateSiweNonce()
      const expiresAt = new Date(Date.now() + nonceExpiryMinutes * 60 * 1000)

      const db = await getDb()
      await db
        .delete(web3Nonce)
        .where(and(eq(web3Nonce.chain, chain), eq(web3Nonce.address, normalizedAddr)))
      await db.insert(web3Nonce).values({
        id: randomUUID(),
        chain,
        address: normalizedAddr,
        nonce,
        expiresAt,
      })

      return reply.code(200).send({ nonce })
    },
  )
}

export default web3NonceRoute
export const prefixOverride = '/auth/web3'
