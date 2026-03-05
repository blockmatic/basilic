import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getAddress } from 'viem'
import { generateSiweNonce } from 'viem/siwe'
import { getDb } from '../../../db/index.js'
import { web3Nonce } from '../../../db/schema/index.js'
import { ErrorResponseSchema } from '../../schemas.js'

const NONCE_EXPIRY_MINUTES = 5
const VALID_CHAINS = ['eip155', 'solana'] as const
type ValidChain = (typeof VALID_CHAINS)[number]

function isValidChain(chain: string): chain is ValidChain {
  return VALID_CHAINS.includes(chain as ValidChain)
}

const NonceResponseSchema = Type.Object({
  nonce: Type.String(),
})

const web3NonceRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get<{
    Querystring: { chain: string; address: string }
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

      if (!isValidChain(chain))
        return reply.code(400).send({
          code: 'INVALID_CHAIN',
          message: 'Chain must be eip155 or solana',
        })

      if (!chain || !address?.trim())
        return reply.code(400).send({
          code: 'MISSING_PARAMS',
          message: 'chain and address query parameters are required',
        })

      const db = await getDb()
      let normalizedAddr: string
      try {
        normalizedAddr =
          chain === 'eip155' ? getAddress(address.trim()).toLowerCase() : address.trim()
      } catch {
        return reply.code(400).send({
          code: 'INVALID_ADDRESS',
          message: 'Invalid wallet address',
        })
      }

      const nonce = generateSiweNonce()
      const expiresAt = new Date(Date.now() + NONCE_EXPIRY_MINUTES * 60 * 1000)

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
