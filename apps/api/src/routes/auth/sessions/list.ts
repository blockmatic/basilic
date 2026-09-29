import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { sessions } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { and, desc, eq, gt } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { sendCatalogError } from "../../../lib/catalogs/mapper.js";
import { ErrorResponseSchema } from "../../schemas.js";

const SessionItemSchema = Type.Object({
  createdAt: Type.String({ format: "date-time" }),
  deviceLabel: Type.Union([Type.String(), Type.Null()]),
  id: Type.String({ format: "uuid" }),
  ipAddress: Type.Union([Type.String(), Type.Null()]),
  isCurrent: Type.Boolean(),
  location: Type.Union([Type.String(), Type.Null()]),
  signInMethod: Type.Union([Type.String(), Type.Null()]),
});

const ListResponseSchema = Type.Object({
  sessions: Type.Array(SessionItemSchema),
});

const sessionsListRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/",
    {
      schema: {
        description: "List non-expired sessions for the authenticated user",
        operationId: "authSessionsList",
        response: {
          200: ListResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "List sessions",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return sendCatalogError({ reply, status: 401, code: "UNAUTHORIZED" });
      }
      if (request.session.authKind === "api-key") {
        return sendCatalogError({ reply, status: 400, code: "USE_KEY_REVOKE" });
      }

      const db = await getDb();
      const rows = await db
        .select({
          createdAt: sessions.createdAt,
          deviceLabel: sessions.deviceLabel,
          id: sessions.id,
          ipAddress: sessions.ipAddress,
          location: sessions.location,
          signInMethod: sessions.signInMethod,
        })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, request.session.user.id),
            gt(sessions.expiresAt, new Date())
          )
        )
        .orderBy(desc(sessions.createdAt));

      const currentId = request.session.session.id;
      return reply.code(200).send({
        sessions: rows.map((row) => ({
          createdAt: row.createdAt.toISOString(),
          deviceLabel: row.deviceLabel,
          id: row.id,
          ipAddress: row.ipAddress,
          isCurrent: row.id === currentId,
          location: row.location,
          signInMethod: row.signInMethod,
        })),
      });
    }
  );
};

export default sessionsListRoute;
export const prefixOverride = "/auth/sessions";
