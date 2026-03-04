import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { SiweMessage } from 'siwe'
import { getDb } from '../../../../db/index.js'
import { verifyWeb3Auth } from '../../../../lib/auth-web3.js'
import { createSessionAndIssueTokens } from '../../../../lib/session.js'
import { ErrorResponseSchema } from '../../../schemas.js'
import { validateEip155Address } from '../validate-address.js'

const VerifySchema = Type.Object({
  message: Type.String(),
  signature: Type.String(),
  domain: Type.Optional(Type.String()),
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
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { message, signature, domain: expectedDomain } = request.body

      const result = await verifyWeb3Auth({
        chain: 'eip155',
        message,
        signature,
        expectedDomain,
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

      return reply.code(200).send({ token: accessToken, refreshToken })
    },
  )
}

export default eip155VerifyRoute
export const prefixOverride = '/auth/web3/eip155'
