import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { getTrending } from '@repo/markets'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { coinsRouteRateLimitConfig } from '../../../lib/coins/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

const ProvenanceSchema = Type.Union([
  Type.Literal('live'),
  Type.Literal('fixture'),
  Type.Literal('stale'),
])

const TrendingCoinSchema = Type.Object({
  id: Type.String(),
  symbol: Type.String(),
  name: Type.String(),
  rank: Type.Union([Type.Number(), Type.Null()]),
  source: ProvenanceSchema,
})

const TrendingResultSchema = Type.Object({
  coins: Type.Array(TrendingCoinSchema),
  source: ProvenanceSchema,
})

const coinsTrendingGetRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/trending',
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        operationId: 'getCoinTrending',
        description:
          'Cached CoinGecko trending coins. Vendor failure returns fixture trending (HTTP 200).',
        summary: 'Get trending coins',
        tags: ['coins'],
        security: [{ bearerAuth: [] }],
        response: {
          200: TrendingResultSchema,
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      return reply.code(200).send(await getTrending())
    },
  )
}

export default coinsTrendingGetRoute
export const prefixOverride = '/coins'
