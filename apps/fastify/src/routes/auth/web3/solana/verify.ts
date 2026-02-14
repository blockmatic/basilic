import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import bs58 from 'bs58'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import nacl from 'tweetnacl'
import { getDb } from '../../../../db/index.js'
import { sessions, users, walletIdentities, web3Nonce } from '../../../../db/schema/index.js'
import { env } from '../../../../lib/env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../../../../lib/jwt.js'
import { ErrorResponseSchema } from '../../../schemas.js'
import { parseSiwsMessage } from '../siws-parse.js'
import { validateSolanaAddress } from '../validate-address.js'

const VerifySchema = Type.Object({
  message: Type.String(),
  signature: Type.String(),
})

const VerifyResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const solanaVerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'web3SolanaVerify',
        description: 'Verify SIWS signature and return JWTs',
        summary: 'Verify Solana signature',
        tags: ['auth'],
        security: [],
        body: VerifySchema,
        response: {
          200: VerifyResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { message, signature } = request.body

      const parsed = parseSiwsMessage(message)
      if (!parsed) {
        return reply.code(401).send({
          code: 'INVALID_MESSAGE',
          message: 'Invalid message format',
        })
      }

      if (env.SIWE_DOMAIN && parsed.domain !== env.SIWE_DOMAIN) {
        return reply.code(401).send({
          code: 'INVALID_DOMAIN',
          message: 'Domain mismatch',
        })
      }

      let validatedAddress: string
      try {
        validatedAddress = validateSolanaAddress(parsed.address)
      } catch {
        return reply.code(401).send({
          code: 'INVALID_ADDRESS',
          message: 'Invalid Solana address',
        })
      }

      const db = await getDb()
      const [nonceRecord] = await db
        .select()
        .from(web3Nonce)
        .where(
          and(
            eq(web3Nonce.chain, 'solana'),
            eq(web3Nonce.address, validatedAddress),
            eq(web3Nonce.nonce, parsed.nonce),
          ),
        )

      if (!nonceRecord) {
        return reply.code(401).send({
          code: 'INVALID_NONCE',
          message: 'Invalid or unknown nonce',
        })
      }

      if (nonceRecord.expiresAt < new Date()) {
        await db.delete(web3Nonce).where(eq(web3Nonce.id, nonceRecord.id))
        return reply.code(401).send({
          code: 'EXPIRED_NONCE',
          message: 'Nonce has expired',
        })
      }

      let publicKeyBytes: Uint8Array
      let signatureBytes: Uint8Array
      try {
        publicKeyBytes = bs58.decode(validatedAddress)
        signatureBytes = bs58.decode(signature)
      } catch {
        return reply.code(401).send({
          code: 'INVALID_SIGNATURE',
          message: 'Invalid signature encoding',
        })
      }

      if (
        publicKeyBytes.length !== nacl.sign.publicKeyLength ||
        signatureBytes.length !== nacl.sign.signatureLength
      ) {
        return reply.code(401).send({
          code: 'INVALID_SIGNATURE',
          message: 'Invalid signature length',
        })
      }

      const messageBytes = new TextEncoder().encode(message)
      const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
      if (!valid) {
        return reply.code(401).send({
          code: 'INVALID_SIGNATURE',
          message: 'Signature does not match',
        })
      }

      await db.delete(web3Nonce).where(eq(web3Nonce.id, nonceRecord.id))

      const [wallet] = await db
        .select()
        .from(walletIdentities)
        .where(
          and(eq(walletIdentities.chain, 'solana'), eq(walletIdentities.address, validatedAddress)),
        )

      let user: typeof users.$inferSelect | undefined
      if (wallet) {
        const [u] = await db.select().from(users).where(eq(users.id, wallet.userId))
        user = u
      }

      if (!user) {
        const userId = randomUUID()
        await db.insert(users).values({
          id: userId,
          email: null,
          emailVerified: false,
        })
        await db.insert(walletIdentities).values({
          id: randomUUID(),
          userId,
          chain: 'solana',
          address: validatedAddress,
          walletProvider: null,
        })
        const [created] = await db.select().from(users).where(eq(users.id, userId))
        if (!created) throw new Error('Failed to create user')
        user = created
      } else if (wallet) {
        await db
          .update(walletIdentities)
          .set({ lastUsedAt: new Date() })
          .where(eq(walletIdentities.id, wallet.id))
      }

      const sessionId = randomUUID()
      const refreshJti = generateJti()
      const refreshJtiHash = hashToken(refreshJti)
      const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

      const walletInfo = { chain: 'solana' as const, address: validatedAddress }
      await db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        token: refreshJtiHash,
        expiresAt: sessionExpiresAt,
        walletChain: walletInfo.chain,
        walletAddress: walletInfo.address,
      })

      const accessPayload = createAccessTokenPayload({
        userId: user.id,
        sessionId,
        wallet: walletInfo,
      })
      const refreshPayload = createRefreshTokenPayload({
        userId: user.id,
        sessionId,
        jti: refreshJti,
      })

      const accessToken = fastify.jwt.sign(accessPayload, {
        expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
      })
      const refreshToken = fastify.jwt.sign(refreshPayload, {
        expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
      })

      return reply.code(200).send({
        token: accessToken,
        refreshToken,
      })
    },
  )
}

export default solanaVerifyRoute
export const prefixOverride = '/auth/web3/solana'
