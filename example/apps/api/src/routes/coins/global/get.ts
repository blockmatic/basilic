import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getGlobal } from "@repo/markets";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { coinsRouteRateLimitConfig } from "../../../lib/coins/index.js";
import { RateLimitResponseSchema } from "../../schemas.js";

const ProvenanceSchema = Type.Union([
  Type.Literal("live"),
  Type.Literal("fixture"),
  Type.Literal("stale"),
]);

const GlobalStatsSchema = Type.Object({
  btcDominance: Type.Number(),
  marketCapUsd: Type.Number(),
  source: ProvenanceSchema,
  volumeUsd: Type.Number(),
});

const coinsGlobalGetRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/global",
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        description:
          "Cached CoinGecko global market stats (total cap, volume, BTC dominance). Vendor failure returns fixture stats (HTTP 200). Public.",
        operationId: "getCoinGlobal",
        response: {
          200: GlobalStatsSchema,
          429: RateLimitResponseSchema,
        },
        security: [],
        summary: "Get global market stats",
        tags: ["coins"],
      },
    },
    async (_request, reply) => reply.code(200).send(await getGlobal())
  );
};

export default coinsGlobalGetRoute;
export const prefixOverride = "/coins";
