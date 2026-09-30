import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { unwatchAsset } from "@repo/db";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { sendCatalogError } from "../../../lib/catalogs/mapper.js";
import { coinsRouteRateLimitConfig } from "../../../lib/coins/index.js";
import { ErrorResponseSchema, RateLimitResponseSchema } from "../../schemas.js";

const AssetIdParamsSchema = Type.Object({
  assetId: Type.String({ minLength: 1 }),
});

const coinsWatchesDeleteRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    "/:assetId",
    {
      config: coinsRouteRateLimitConfig,
      schema: {
        description:
          "Remove an asset id from the access JWT user watchlist. Missing rows still return 204.",
        operationId: "deleteCoinWatchById",
        params: AssetIdParamsSchema,
        response: {
          204: Type.Null(),
          401: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Unwatch a coin",
        tags: ["coins"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return sendCatalogError({ reply, status: 401, code: "UNAUTHORIZED" });
      }
      await unwatchAsset({
        assetId: request.params.assetId,
        userId: request.session.user.id,
      });
      return reply.code(204).send(null);
    }
  );
};

export default coinsWatchesDeleteRoute;
export const prefixOverride = "/coins/watches";
