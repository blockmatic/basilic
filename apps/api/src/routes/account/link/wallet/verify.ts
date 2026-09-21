import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { getDb } from '@repo/db'
import { users, walletIdentities, web3Nonce } from '@repo/db/schema'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError } from '../../../../lib/catalogs/mapper.js'
import { env } from '../../../../lib/env.js'
import {
  getCanonicalAddress,
  isAllowedWeb3Domain,
  parseSignInMessage,
  verifyWalletSignature,
  walletIdentityAddressEquals,
} from '../../../../lib/web3/index.js'
import { ErrorResponseSchema } from '../../../schemas.js'

const validChains = ['eip155', 'solana'] as const

function isValidChain(chain: string): chain is (typeof validChains)[number] {
  return validChains.includes(chain as (typeof validChains)[number])
}

const VerifySchema = Type.Object({
  chain: Type.Union([Type.Literal('eip155'), Type.Literal('solana')]),
  message: Type.String(),
  signature: Type.String(),
  domain: Type.String({ minLength: 1 }),
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
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })

      const { chain, message, signature, domain } = request.body
      if (!isValidChain(chain))
        return sendCatalogError({ reply, status: 400, code: 'INVALID_ADDRESS' })

      if (!isAllowedWeb3Domain({ domain, allowedOrigins: env.ALLOWED_ORIGINS }))
        return sendCatalogError({ reply, status: 400, code: 'INVALID_DOMAIN' })

      const parsed = parseSignInMessage(message)
      if (!parsed) return sendCatalogError({ reply, status: 400, code: 'INVALID_MESSAGE' })

      if (parsed.domain !== domain)
        return sendCatalogError({ reply, status: 400, code: 'INVALID_DOMAIN' })

      const lookupAddr = getCanonicalAddress({ chain, address: parsed.address })
      if (!lookupAddr) return sendCatalogError({ reply, status: 400, code: 'INVALID_ADDRESS' })

      const db = await getDb()
      const [userRow] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, request.session.user.id))

      if (!userRow?.email) return sendCatalogError({ reply, status: 400, code: 'EMAIL_REQUIRED' })

      const [nonceRow] = await db
        .select()
        .from(web3Nonce)
        .where(and(eq(web3Nonce.chain, chain), eq(web3Nonce.address, lookupAddr)))

      if (!nonceRow) return sendCatalogError({ reply, status: 401, code: 'INVALID_NONCE' })

      if (nonceRow.expiresAt < new Date()) {
        await db.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))
        return sendCatalogError({ reply, status: 401, code: 'EXPIRED_NONCE' })
      }

      if (nonceRow.nonce !== parsed.nonce)
        return sendCatalogError({ reply, status: 401, code: 'INVALID_NONCE' })

      const { valid, normalizedAddress } = await verifyWalletSignature({
        chain,
        message,
        signature,
        address: parsed.address,
      })

      if (!valid || !normalizedAddress)
        return sendCatalogError({ reply, status: 401, code: 'INVALID_SIGNATURE' })

      const userId = request.session.user.id
      let walletAlreadyLinked = false
      let walletEip155Limit = false

      try {
        await db.transaction(async tx => {
          const matches = await tx
            .select()
            .from(walletIdentities)
            .where(
              and(
                eq(walletIdentities.chain, chain),
                walletIdentityAddressEquals({ address: normalizedAddress }),
              ),
            )
          const existing = matches.find(row => row.address === normalizedAddress) ?? matches[0]

          if (existing) {
            if (existing.userId !== userId) {
              walletAlreadyLinked = true
              await tx.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))
              return
            }
            await tx.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))
            return
          }

          if (chain === 'eip155') {
            const [ownEip155] = await tx
              .select({ id: walletIdentities.id })
              .from(walletIdentities)
              .where(and(eq(walletIdentities.userId, userId), eq(walletIdentities.chain, 'eip155')))
              .limit(1)
            if (ownEip155) {
              walletEip155Limit = true
              await tx.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))
              return
            }
          }

          await tx.insert(walletIdentities).values({
            id: randomUUID(),
            userId,
            chain,
            address: normalizedAddress,
          })
          await tx.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))
        })
      } catch (err) {
        const code =
          (err as { cause?: { code?: string }; code?: string }).cause?.code ??
          (err as { code?: string }).code
        if (code === '23505') {
          await db.delete(web3Nonce).where(eq(web3Nonce.id, nonceRow.id))
          return sendCatalogError({ reply, status: 409, code: 'WALLET_ALREADY_LINKED' })
        }
        throw err
      }

      if (walletAlreadyLinked)
        return sendCatalogError({ reply, status: 409, code: 'WALLET_ALREADY_LINKED' })
      if (walletEip155Limit)
        return sendCatalogError({ reply, status: 409, code: 'WALLET_EIP155_LIMIT' })

      return reply.code(200).send({ ok: true })
    },
  )
}

export default walletVerifyRoute
export const prefixOverride = '/account/link/wallet'
