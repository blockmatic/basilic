import { randomUUID } from 'node:crypto'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { SiweMessage } from 'siwe'
import { encryptCallbackTokens } from '../../../../db/callback-tokens.js'
import { getDb } from '../../../../db/index.js'
import { web3Callback } from '../../../../db/schema/index.js'
import { sendCatalogError } from '../../../../lib/catalogs/mapper.js'
import { env } from '../../../../lib/env.js'
import { generateToken, hashToken } from '../../../../lib/jwt.js'
import { createSessionAndIssueTokens } from '../../../../lib/session.js'
import { appendCodeToCallbackUrl, isAllowedUrl } from '../../../../lib/url.js'
import { isAllowedWeb3Domain, verifyWeb3Auth } from '../../../../lib/web3/index.js'
import { ErrorResponseSchema } from '../../../schemas.js'
import { validateEip155Address } from '../validate-address.js'

const callbackCodeExpiryMinutes = 5

const VerifySchema = Type.Object({
  message: Type.String(),
  signature: Type.String(),
  domain: Type.String({ minLength: 1 }),
  callbackUrl: Type.Optional(Type.String()),
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
          302: Type.Object({ description: Type.Optional(Type.String()) }),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { message, signature, domain, callbackUrl } = request.body

      if (!isAllowedWeb3Domain({ domain, allowedOrigins: env.ALLOWED_ORIGINS }))
        return sendCatalogError({ reply, status: 400, code: 'INVALID_DOMAIN' })

      if (callbackUrl && !isAllowedUrl(callbackUrl))
        return sendCatalogError({ reply, status: 400, code: 'INVALID_CALLBACK_URL' })

      const result = await verifyWeb3Auth({
        chain: 'eip155',
        message,
        signature,
        expectedDomain: domain,
        parseMessage: msg => {
          try {
            const m = new SiweMessage(msg)
            return { address: m.address, nonce: m.nonce, domain: m.domain }
          } catch {
            return null
          }
        },
        validateAddress: validateEip155Address,
        verifySignature: async ({ message: msg, signature: sig }) => {
          // Valid ECDSA signature: 0x + 65 bytes (r,s,v) = 130 hex chars
          if (!/^0x[a-fA-F0-9]{130}$/.test(sig)) return false
          const m = new SiweMessage(msg)
          const r = await m.verify({ signature: sig }, { suppressExceptions: true })
          return r.success
        },
      })

      if (!result.ok) return reply.code(401).send({ code: result.code, message: result.message })

      const db = await getDb()
      const walletInfo = { chain: 'eip155' as const, address: result.validatedAddress }
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
        const encrypted = encryptCallbackTokens({ accessToken, refreshToken })
        await db.insert(web3Callback).values({
          id: randomUUID(),
          codeHash,
          accessToken: encrypted.accessToken,
          refreshToken: encrypted.refreshToken,
          expiresAt,
        })
        return reply.redirect(appendCodeToCallbackUrl(callbackUrl, code), 302)
      }

      return reply.code(200).send({ token: accessToken, refreshToken })
    },
  )
}

export default eip155VerifyRoute
export const prefixOverride = '/auth/web3/eip155'
