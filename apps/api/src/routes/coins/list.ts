import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import type { FastifyPluginAsync } from "fastify";

import { sendCatalogError } from "../../lib/catalogs/mapper.js";
import {
  coerceSearchQuerystring,
  coinsRouteRateLimitConfig,
  QueryCoinsResponseSchema,
  queryCoins,
  SearchQuerySchema,
} from "../../lib/coins/index.js";
import { ErrorResponseSchema, RateLimitResponseSchema } from "../schemas.js";

const coinsListRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/",
    {
      config: coinsRouteRateLimitConfig,
      preValidation: async (request) => {
        coerceSearchQuerystring({
          query: request.query as Record<string, unknown>,
        });
      },
      schema: {
        description:
          "List cached CoinGecko markets joined to identity assets, optionally filtered by SearchQuery querystring. Seeds identity when the registry is empty. Vendor failure returns fixture quotes. Arrays are comma-separated (symbols=eth,sol). Public except universe=watchlist, which needs a session JWT.",
        operationId: "listCoins",
        querystring: SearchQuerySchema,
        response: {
          200: QueryCoinsResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
        security: [],
        summary: "List coins",
        tags: ["coins"],
      },
    },
    async (request, reply) => {
      if (request.query.universe === "watchlist" && !request.session) {
        return sendCatalogError({ reply, status: 401, code: "UNAUTHORIZED" });
      }
      const db = await getDb();
      return reply.code(200).send(
        await queryCoins({
          db,
          query: request.query,
          userId: request.session?.user.id ?? "",
        })
      );
    }
  );
};

export default coinsListRoute;
export const prefixOverride = "/coins";
