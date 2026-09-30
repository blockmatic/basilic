import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getTrending } from "@repo/markets";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { coinsRouteRateLimitConfig } from "../../../lib/coins/index.js";
import { RateLimitResponseSchema } from "../../schemas.js";

const ProvenanceSchema = Type.Union([
  Type.Literal("live"),
  Type.Literal("fixture"),
  Type.Literal("stale"),
]);

const TrendingCoinSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  rank: Type.Union([Type.Number(), Type.Null()]),
  source: ProvenanceSchema,
  symbol: Type.String(),
});

const TrendingResultSchema = Type.Object({
  coins: Type.Array(TrendingCoinSchema),
  source: ProvenanceSchema,
});

const coinsTrendingGetRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/trending",
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        description:
          "Cached CoinGecko trending coins. Vendor failure returns fixture trending (HTTP 200). Public.",
        operationId: "getCoinTrending",
        response: {
          200: TrendingResultSchema,
          429: RateLimitResponseSchema,
        },
        security: [],
        summary: "Get trending coins",
        tags: ["coins"],
      },
    },
    async (_request, reply) => reply.code(200).send(await getTrending())
  );
};

export default coinsTrendingGetRoute;
export const prefixOverride = "/coins";
