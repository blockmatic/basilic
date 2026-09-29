import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import type { FastifyPluginAsync } from "fastify";

import { sendCatalogError } from "../../lib/catalogs/mapper.js";
import {
  coinsRouteRateLimitConfig,
  QueryCoinsResponseSchema,
  queryCoins,
  SearchQuerySchema,
} from "../../lib/coins/index.js";
import { ErrorResponseSchema, RateLimitResponseSchema } from "../schemas.js";

const coinsQueryRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/query",
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        body: SearchQuerySchema,
        description:
          "Apply a SearchQuery body to the cached CoinGecko markets list. Same filters as GET /coins querystring. Watchlist uses the access JWT sub. Public except universe=watchlist. Vendor failure returns fixture quotes.",
        operationId: "queryCoins",
        response: {
          200: QueryCoinsResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
        security: [],
        summary: "Query coins",
        tags: ["coins"],
      },
    },
    async (request, reply) => {
      if (request.body.universe === "watchlist" && !request.session) {
        return sendCatalogError({ reply, status: 401, code: "UNAUTHORIZED" });
      }
      const db = await getDb();
      return reply.code(200).send(
        await queryCoins({
          db,
          query: request.body,
          userId: request.session?.user.id ?? "",
        })
      );
    }
  );
};

export default coinsQueryRoute;
export const prefixOverride = "/coins";
