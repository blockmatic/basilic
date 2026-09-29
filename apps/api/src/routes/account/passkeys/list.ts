import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { passkeyCredentials } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { ErrorResponseSchema } from "../../schemas.js";

const PasskeyItemSchema = Type.Object({
  createdAt: Type.String({ format: "date-time" }),
  id: Type.String(),
  name: Type.String(),
});

const ListResponseSchema = Type.Object({
  passkeys: Type.Array(PasskeyItemSchema),
});

const passkeysListRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/",
    {
      schema: {
        description: "List passkeys for authenticated user",
        operationId: "accountPasskeysList",
        response: {
          200: ListResponseSchema,
          401: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "List passkeys",
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
          createdAt: passkeyCredentials.createdAt,
          id: passkeyCredentials.id,
          name: passkeyCredentials.name,
        })
        .from(passkeyCredentials)
        .where(eq(passkeyCredentials.userId, request.session.user.id));

      return reply.code(200).send({
        passkeys: rows.map((r) => ({
          createdAt: r.createdAt.toISOString(),
          id: r.id,
          name: r.name,
        })),
      });
    }
  );
};

export default passkeysListRoute;
export const prefixOverride = "/account/passkeys";
