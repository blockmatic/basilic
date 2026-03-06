import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import bs58 from 'bs58'
import type { FastifyPluginAsync } from 'fastify'
import nacl from 'tweetnacl'
import { getDb } from '../../../../db/index.js'
import { web3Callback } from '../../../../db/schema/index.js'
import { verifyWeb3Auth } from '../../../../lib/auth-web3.js'
import { generateToken, hashToken } from '../../../../lib/jwt.js'
import { createSessionAndIssueTokens } from '../../../../lib/session.js'
import { appendCodeToCallbackUrl, isAllowedUrl } from '../../../../lib/url.js'
import { ErrorResponseSchema } from '../../../schemas.js'
import { parseSiwsMessage } from '../siws-parse.js'
import { validateSolanaAddress } from '../validate-address.js'

const callbackCodeExpiryMinutes = 5

const VerifySchema = Type.Object({
  message: Type.String(),
  signature: Type.String(),
  domain: Type.Optional(Type.String()),
  callbackUrl: Type.Optional(Type.String()),
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
          302: Type.Object({ description: Type.Optional(Type.String()) }),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { message, signature, domain: expectedDomain, callbackUrl } = request.body

      if (callbackUrl && !isAllowedUrl(callbackUrl))
        return reply.code(400).send({
          code: 'INVALID_CALLBACK_URL',
          message: 'Callback URL origin is not allowed',
        })

      const result = await verifyWeb3Auth({
        chain: 'solana',
        message,
        signature,
        expectedDomain,
        parseMessage: parseSiwsMessage,
        validateAddress: validateSolanaAddress,
        verifySignature: async ({ message: msg, signature: sig, validatedAddress }) => {
          try {
            const publicKeyBytes = bs58.decode(validatedAddress)
            const signatureBytes = bs58.decode(sig)
            if (
              publicKeyBytes.length !== nacl.sign.publicKeyLength ||
              signatureBytes.length !== nacl.sign.signatureLength
            )
              return false

            return nacl.sign.detached.verify(
              new TextEncoder().encode(msg),
              signatureBytes,
              publicKeyBytes,
            )
          } catch {
            return false
          }
        },
      })

      if (!result.ok) return reply.code(401).send({ code: result.code, message: result.message })

      const db = await getDb()
      const walletInfo = { chain: 'solana' as const, address: result.validatedAddress }
      const { accessToken, refreshToken } = await createSessionAndIssueTokens({
        fastify,
        db,
        userId: result.userId,
        wallet: walletInfo,
      })

      if (callbackUrl) {
        const code = generateToken()
        const codeHash = hashToken(code)
        const expiresAt = new Date(Date.now() + callbackCodeExpiryMinutes * 60 * 1000)
        await db.insert(web3Callback).values({
          id: randomUUID(),
          codeHash,
          accessToken,
          refreshToken,
          expiresAt,
        })
        return reply.redirect(appendCodeToCallbackUrl(callbackUrl, code), 302)
      }

      return reply.code(200).send({ token: accessToken, refreshToken })
    },
  )
}

export default solanaVerifyRoute
export const prefixOverride = '/auth/web3/solana'
