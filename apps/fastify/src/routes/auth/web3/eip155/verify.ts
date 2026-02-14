import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { and, eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import { SiweMessage } from 'siwe'
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
import { validateEip155Address } from '../validate-address.js'

const VerifySchema = Type.Object({
  message: Type.String(),
  signature: Type.String(),
})

const VerifyResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
})

const eip155VerifyRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/verify',
    {
      schema: {
        operationId: 'web3Eip155Verify',
        description: 'Verify SIWE signature and return JWTs',
        summary: 'Verify EIP-155 signature',
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

      let siweMessage: SiweMessage
      try {
        siweMessage = new SiweMessage(message)
      } catch {
        return reply.code(401).send({
          code: 'INVALID_MESSAGE',
          message: 'Invalid message format',
        })
      }

      if (env.SIWE_DOMAIN && siweMessage.domain !== env.SIWE_DOMAIN) {
        return reply.code(401).send({
          code: 'INVALID_DOMAIN',
          message: 'Domain mismatch',
        })
      }

      const address = siweMessage.address
      let validatedAddress: string
      try {
        validatedAddress = validateEip155Address(address)
      } catch {
        return reply.code(401).send({
          code: 'INVALID_ADDRESS',
          message: 'Invalid Ethereum address',
        })
      }

      const db = await getDb()
      const [nonceRecord] = await db
        .select()
        .from(web3Nonce)
        .where(
          and(
            eq(web3Nonce.chain, 'eip155'),
            eq(web3Nonce.address, validatedAddress),
            eq(web3Nonce.nonce, siweMessage.nonce),
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

      const result = await siweMessage.verify({ signature }, { suppressExceptions: true })
      if (!result.success) {
        return reply.code(401).send({
          code: 'INVALID_SIGNATURE',
          message: result.error?.type ?? 'Invalid signature',
        })
      }

      await db.delete(web3Nonce).where(eq(web3Nonce.id, nonceRecord.id))

      const [wallet] = await db
        .select()
        .from(walletIdentities)
        .where(
          and(eq(walletIdentities.chain, 'eip155'), eq(walletIdentities.address, validatedAddress)),
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
          chain: 'eip155',
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

      const walletInfo = { chain: 'eip155' as const, address: validatedAddress }
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

export default eip155VerifyRoute
export const prefixOverride = '/auth/web3/eip155'
