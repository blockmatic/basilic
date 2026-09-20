import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { getDb } from '@repo/db'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError } from '../../lib/catalogs/mapper.js'
import { listMarkets } from '../../lib/coins/index.js'
import { ErrorResponseSchema } from '../schemas.js'

const CoinSchema = Type.Object({
  id: Type.String(),
  symbol: Type.String(),
  name: Type.String(),
  imageUrl: Type.Union([Type.String(), Type.Null()]),
  priceUsd: Type.Number(),
  change24h: Type.Number(),
  volumeUsd: Type.Number(),
  marketCapUsd: Type.Number(),
  rank: Type.Integer(),
  fetchedAt: Type.String({ format: 'date-time' }),
})

const CoinSyncSchema = Type.Object({
  source: Type.String(),
  fetchedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  lastError: Type.Union([Type.String(), Type.Null()]),
})

const ListCoinsResponseSchema = Type.Object({
  coins: Type.Array(CoinSchema),
  sync: CoinSyncSchema,
})

const coinsListRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'listCoins',
        description: 'List fixture coin quotes. Seeds identity assets when the registry is empty.',
        summary: 'List coins',
        tags: ['coins'],
        security: [{ bearerAuth: [] }],
        response: {
          200: ListCoinsResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      const db = await getDb()
      return reply.code(200).send(await listMarkets({ db }))
    },
  )
}

export default coinsListRoute
export const prefixOverride = '/coins'
