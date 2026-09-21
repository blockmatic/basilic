import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { sendCatalogError } from '../../../lib/catalogs/mapper.js'
import { coinsRouteRateLimitConfig, getCoinCandles } from '../../../lib/coins/index.js'
import { ErrorResponseSchema, RateLimitResponseSchema } from '../../schemas.js'

const AssetIdParamsSchema = Type.Object({
  assetId: Type.String({ minLength: 1 }),
})

const CandlePeriodSchema = Type.Union([
  Type.Literal('24h'),
  Type.Literal('7d'),
  Type.Literal('30d'),
  Type.Literal('90d'),
  Type.Literal('1y'),
  Type.Literal('6m'),
])

const CandlesQuerySchema = Type.Object({
  period: Type.Optional(CandlePeriodSchema),
})

const CandleSchema = Type.Object({
  openTime: Type.Number(),
  open: Type.Number(),
  high: Type.Number(),
  low: Type.Number(),
  close: Type.Number(),
  volume: Type.Number(),
  closeTime: Type.Number(),
})

const CandlesResponseSchema = Type.Object({
  assetId: Type.String(),
  interval: Type.String(),
  candles: Type.Array(CandleSchema),
  source: Type.Union([Type.Literal('live'), Type.Literal('fixture'), Type.Literal('stale')]),
  provider: Type.Union([
    Type.Literal('coingecko'),
    Type.Literal('binance'),
    Type.Literal('fixture'),
  ]),
})

const coinsCandlesGetRoute: FastifyPluginAsync = async fastify => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/:assetId/candles',
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        operationId: 'getCoinCandles',
        description:
          'Public Binance klines for an identity asset id, mapped from asset_markets. Unmapped assets and vendor failure return empty fixture candles (HTTP 200). period maps to interval plus range; 7d is 1h × 7d, not a kline interval.',
        summary: 'Get coin candles',
        tags: ['coins'],
        security: [{ bearerAuth: [] }],
        params: AssetIdParamsSchema,
        querystring: CandlesQuerySchema,
        response: {
          200: CandlesResponseSchema,
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.session) return sendCatalogError({ reply, status: 401, code: 'UNAUTHORIZED' })
      return reply
        .code(200)
        .send(
          await getCoinCandles({ assetId: request.params.assetId, period: request.query.period }),
        )
    },
  )
}

export default coinsCandlesGetRoute
export const prefixOverride = '/coins'
