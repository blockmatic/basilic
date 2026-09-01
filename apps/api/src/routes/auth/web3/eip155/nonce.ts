import { randomBytes, randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../../../../db/index.js'
import { web3Nonce } from '../../../../db/schema/index.js'
import { sendCatalogError } from '../../../../lib/catalogs/mapper.js'
import { ErrorResponseSchema } from '../../../schemas.js'
import { validateAddress } from '../validate-address.js'

const nonceTtlMs = 5 * 60 * 1000 // 5 minutes

const NonceResponseSchema = Type.Object({
  nonce: Type.String(),
})

const eip155NonceRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/nonce',
    {
      schema: {
        operationId: 'web3Eip155Nonce',
        description: 'Get nonce for SIWE (Sign-In with Ethereum)',
        summary: 'Get EIP-155 nonce',
        tags: ['auth'],
        security: [],
        querystring: Type.Object({
          address: Type.String({ minLength: 1 }),
        }),
        response: {
          200: NonceResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { address } = request.query as { address: string }
      const chain = 'eip155'

      let validatedAddress: string
      try {
        validatedAddress = validateAddress({ chain, address })
      } catch {
        return sendCatalogError({ reply, status: 400, code: 'INVALID_ADDRESS' })
      }

      const nonce = randomBytes(16).toString('hex')
      const expiresAt = new Date(Date.now() + nonceTtlMs)
      const db = await getDb()

      await db
        .delete(web3Nonce)
        .where(and(eq(web3Nonce.chain, chain), eq(web3Nonce.address, validatedAddress)))

      await db.insert(web3Nonce).values({
        id: randomUUID(),
        chain,
        address: validatedAddress,
        nonce,
        expiresAt,
      })

      return reply.code(200).send({ nonce })
    },
  )
}

export default eip155NonceRoute
export const prefixOverride = '/auth/web3/eip155'
