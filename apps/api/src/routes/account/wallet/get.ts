import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { composeOwnWallet } from '../../../lib/wallet/compose.js'
import { ErrorResponseSchema } from '../../schemas.js'

const nullableString = Type.Union([Type.String(), Type.Null()])
const nullableNumber = Type.Union([Type.Number(), Type.Null()])

const WalletTokenSchema = Type.Object({
  network: Type.Union([Type.Literal('eth-mainnet'), Type.Literal('base-mainnet')]),
  tokenAddress: nullableString,
  symbol: nullableString,
  name: nullableString,
  amount: Type.String(),
  quoteUsd: nullableNumber,
  logoUrl: nullableString,
  assetId: nullableString,
})

const WalletNftSchema = Type.Object({
  network: Type.Union([Type.Literal('eth-mainnet'), Type.Literal('base-mainnet')]),
  contractAddress: Type.String(),
  tokenId: Type.String(),
  name: nullableString,
  collectionName: nullableString,
  imageUrl: nullableString,
})

const WalletResponseSchema = Type.Object({
  address: nullableString,
  tokens: Type.Array(WalletTokenSchema),
  nfts: Type.Array(WalletNftSchema),
  error: nullableString,
})

const accountWalletGetRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'accountWalletGet',
        description:
          'Live Alchemy Portfolio for the access JWT user linked eip155 address. Empty when unlinked or key unset.',
        summary: 'Get linked wallet holdings',
        tags: ['account'],
        security: [{ bearerAuth: [] }],
        response: {
          200: WalletResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      return reply.code(200).send(await composeOwnWallet({ userId: request.session.user.id }))
    },
  )
}

export default accountWalletGetRoute
export const prefixOverride = '/account/wallet'
