import { randomUUID } from "node:crypto";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { apiKeys } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { generateApiKey } from "../../../lib/api-keys/index.js";
import { ErrorResponseSchema } from "../../schemas.js";

const CreateSchema = Type.Object({
  name: Type.String({ maxLength: 64, minLength: 1 }),
});

const CreateResponseSchema = Type.Object({
  createdAt: Type.String({ format: "date-time" }),
  id: Type.String(),
  key: Type.String(),
  name: Type.String(),
  prefix: Type.String(),
});

const apikeysCreateRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/",
    {
      schema: {
        body: CreateSchema,
        description: "Create API key (shown once)",
        operationId: "accountApikeysCreate",
        response: {
          200: CreateResponseSchema,
          401: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Create API key",
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

      const { name } = request.body;
      const { key, prefix, hash } = generateApiKey();
      const id = randomUUID();

      const db = await getDb();
      const [row] = await db
        .insert(apiKeys)
        .values({
          hash,
          id,
          name,
          prefix,
          userId: request.session.user.id,
        })
        .returning();

      if (!row) {
        throw new Error("Failed to create API key");
      }

      return reply.code(200).send({
        createdAt: row.createdAt.toISOString(),
        id: row.id,
        key,
        name: row.name,
        prefix: row.prefix,
      });
    }
  );
};

export default apikeysCreateRoute;
export const prefixOverride = "/account/apikeys";
