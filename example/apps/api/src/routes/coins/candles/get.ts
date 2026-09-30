import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import {
  coinsRouteRateLimitConfig,
  getCoinCandles,
} from "../../../lib/coins/index.js";
import { RateLimitResponseSchema } from "../../schemas.js";

const AssetIdParamsSchema = Type.Object({
  assetId: Type.String({ minLength: 1 }),
});

const CandlePeriodSchema = Type.Union([
  Type.Literal("24h"),
  Type.Literal("7d"),
  Type.Literal("30d"),
  Type.Literal("90d"),
  Type.Literal("1y"),
  Type.Literal("6m"),
]);

const CandlesQuerySchema = Type.Object({
  period: Type.Optional(CandlePeriodSchema),
});

const CandleSchema = Type.Object({
  close: Type.Number(),
  closeTime: Type.Number(),
  high: Type.Number(),
  low: Type.Number(),
  open: Type.Number(),
  openTime: Type.Number(),
  volume: Type.Number(),
});

const CandlesResponseSchema = Type.Object({
  assetId: Type.String(),
  candles: Type.Array(CandleSchema),
  interval: Type.String(),
  provider: Type.Union([
    Type.Literal("coingecko"),
    Type.Literal("binance"),
    Type.Literal("fixture"),
  ]),
  source: Type.Union([
    Type.Literal("live"),
    Type.Literal("fixture"),
    Type.Literal("stale"),
  ]),
});

const coinsCandlesGetRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/:assetId/candles",
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        description:
          "Public Binance klines for an identity asset id, mapped from asset_markets. Unmapped assets and vendor failure return empty fixture candles (HTTP 200). period maps to interval plus range; 7d is 1h × 7d, not a kline interval.",
        operationId: "getCoinCandles",
        params: AssetIdParamsSchema,
        querystring: CandlesQuerySchema,
        response: {
          200: CandlesResponseSchema,
          429: RateLimitResponseSchema,
        },
        security: [],
        summary: "Get coin candles",
        tags: ["coins"],
      },
    },
    async (request, reply) =>
      reply.code(200).send(
        await getCoinCandles({
          assetId: request.params.assetId,
          period: request.query.period,
        })
      )
  );
};

export default coinsCandlesGetRoute;
export const prefixOverride = "/coins";
