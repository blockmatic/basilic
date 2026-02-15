import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { getAddress } from 'viem'
import { getDb } from '../../../../db/index.js'
import { walletIdentities, web3Nonce } from '../../../../db/schema/index.js'
import { parseSignInMessage, verifyWalletSignature } from '../../../../lib/web3-verify.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const VALID_CHAINS = ['eip155', 'solana'] as const

function isValidChain(chain: string): chain is (typeof VALID_CHAINS)[number] {
  return VALID_CHAINS.includes(chain as (typeof VALID_CHAINS)[number])
}

const VerifySchema = Type.Object({
  chain: Type.Union([Type.Literal('eip155'), Type.Literal('solana')]),
  message: Type.String(),
  signature: Type.String(),
})

const VerifyResponseSchema = Type.Object({
  ok: Type.Boolean(),
})

const walletVerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'accountLinkWalletVerify',
        description: 'Link wallet to authenticated user',
        summary: 'Link wallet',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        body: VerifySchema,
        response: {
          200: VerifyResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })
      }

      const { chain, message, signature } = request.body
      if (!isValidChain(chain)) {
        return reply.code(400).send({
          code: 'INVALID_CHAIN',
          message: 'Chain must be eip155 or solana',
        })
      }

      const parsed = parseSignInMessage(message)
      if (!parsed) {
        return reply.code(400).send({
          code: 'INVALID_MESSAGE',
          message: 'Invalid sign-in message format',
        })
      }

      const lookupAddr =
        chain === 'eip155'
          ? (() => {
              try {
                return getAddress(parsed.address).toLowerCase()
              } catch {
                return null
              }
            })()
          : parsed.address
      if (!lookupAddr) {
        return reply.code(400).send({
          code: 'INVALID_ADDRESS',
          message: 'Invalid wallet address in message',
        })
      }

      const db = await getDb()

      const [nonceRow] = await db
        .select()
        .from(web3Nonce)
        .where(and(eq(web3Nonce.chain, chain), eq(web3Nonce.address, lookupAddr)))

      if (!nonceRow) {
        return reply.code(401).send({
          code: 'INVALID_NONCE',
          message: 'No nonce found for this wallet. Request one first.',
        })
      }

      if (nonceRow.expiresAt < new Date()) {
        await db.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))
        return reply.code(401).send({
          code: 'EXPIRED_NONCE',
          message: 'Nonce expired. Request a new one.',
        })
      }

      if (nonceRow.nonce !== parsed.nonce) {
        return reply.code(401).send({
          code: 'INVALID_NONCE',
          message: 'Nonce does not match',
        })
      }

      const { valid, normalizedAddress } = await verifyWalletSignature({
        chain,
        message,
        signature,
        address: parsed.address,
      })

      if (!valid || !normalizedAddress) {
        return reply.code(401).send({
          code: 'INVALID_SIGNATURE',
          message: 'Signature verification failed',
        })
      }

      const [existing] = await db
        .select()
        .from(walletIdentities)
        .where(
          and(eq(walletIdentities.chain, chain), eq(walletIdentities.address, normalizedAddress)),
        )

      if (existing) {
        if (existing.userId !== request.session.user.id) {
          return reply.code(409).send({
            code: 'WALLET_ALREADY_LINKED',
            message: 'This wallet is already linked to another account',
          })
        }
        await db.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))
        return reply.code(200).send({ ok: true })
      }

      await db.insert(walletIdentities).values({
        id: randomUUID(),
        userId: request.session.user.id,
        chain,
        address: normalizedAddress,
      })

      await db.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))

      return reply.code(200).send({ ok: true })
    },
  )
}

export default walletVerifyRoute
export const prefixOverride = '/account/link/wallet'
