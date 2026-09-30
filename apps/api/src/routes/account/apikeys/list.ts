import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { apiKeys } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { ErrorResponseSchema } from "../../schemas.js";

function toApiKeyItem(row: {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}) {
  return {
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
    id: row.id,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    name: row.name,
    prefix: row.prefix,
  };
}

const ApiKeyItemSchema = Type.Object({
  createdAt: Type.String({ format: "date-time" }),
  expiresAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  id: Type.String(),
  lastUsedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  name: Type.String(),
  prefix: Type.String(),
});

const ListResponseSchema = Type.Object({
  keys: Type.Array(ApiKeyItemSchema, { maxItems: 50 }),
});

const apikeysListRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/",
    {
      schema: {
        description: "List API keys for authenticated user",
        operationId: "accountApikeysList",
        response: {
          200: ListResponseSchema,
          401: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "List API keys",
        tags: ["account"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const db = await getDb();
      const rows = await db
        .select({
          createdAt: apiKeys.createdAt,
          expiresAt: apiKeys.expiresAt,
          id: apiKeys.id,
          lastUsedAt: apiKeys.lastUsedAt,
          name: apiKeys.name,
          prefix: apiKeys.prefix,
        })
        .from(apiKeys)
        .where(eq(apiKeys.userId, request.session.user.id));

      return reply.code(200).send({ keys: rows.map(toApiKeyItem) });
    }
  );
};

export default apikeysListRoute;
export const prefixOverride = "/account/apikeys";
