import { getDb } from "@repo/db";
import { account, passkeyCredentials, totp, users } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import {
  sendCatalogError,
  sendServerCatalogError,
} from "../../../lib/catalogs/mapper.js";
import { ErrorResponseSchema } from "../../schemas.js";

const PasskeySchema = Type.Object({
  createdAt: Type.String({ format: "date-time" }),
  id: Type.String(),
  name: Type.String(),
});

const LinkedAccountSchema = Type.Object({
  providerId: Type.String(),
});

const UserResponseSchema = Type.Object({
  user: Type.Object({
    email: Type.Union([Type.String(), Type.Null()]),
    emailVerified: Type.Boolean(),
    id: Type.String(),
    linkedAccounts: Type.Array(LinkedAccountSchema),
    name: Type.Union([Type.String(), Type.Null()]),
    passkeys: Type.Array(PasskeySchema),
    totpEnabled: Type.Boolean(),
    username: Type.Union([Type.String(), Type.Null()]),
  }),
});

const sessionUserRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/user",
    {
      schema: {
        description: "Get current user information",
        operationId: "getUser",
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Get user",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return sendCatalogError({ reply, status: 401, code: "UNAUTHORIZED" });
      }

      const userId = request.session.user.id;
      let linkedAccounts: { providerId: string }[];
      let totpEnabled: boolean;
      let passkeys: { id: string; name: string; createdAt: string }[];
      let userRow:
        | {
            name?: string | null;
            username?: string | null;
            emailVerified?: boolean;
          }
        | undefined;

      try {
        const db = await getDb();
        const accountRows = await db
          .select({ providerId: account.providerId })
          .from(account)
          .where(eq(account.userId, userId));
        const uniqueProviderIds = [
          ...new Set(accountRows.map((a) => a.providerId)),
        ];
        linkedAccounts = uniqueProviderIds.map((providerId) => ({
          providerId,
        }));

        const [totpRow] = await db
          .select()
          .from(totp)
          .where(eq(totp.userId, userId));
        totpEnabled = !!totpRow;

        const passkeyRows = await db
          .select({
            createdAt: passkeyCredentials.createdAt,
            id: passkeyCredentials.id,
            name: passkeyCredentials.name,
          })
          .from(passkeyCredentials)
          .where(eq(passkeyCredentials.userId, userId));
        passkeys = passkeyRows.map((p) => ({
          createdAt: p.createdAt.toISOString(),
          id: p.id,
          name: p.name,
        }));

        [userRow] = await db
          .select({
            emailVerified: users.emailVerified,
            name: users.name,
            username: users.username,
          })
          .from(users)
          .where(eq(users.id, userId));
      } catch (error) {
        return sendServerCatalogError({
          request,
          reply,
          code: "SERVER_ERROR",
          error: error,
        });
      }

      return reply.code(200).send({
        user: {
          id: request.session.user.id,
          email: request.session.user.email,
          name: userRow?.name ?? request.session.user.name ?? null,
          username: userRow?.username ?? request.session.user.username ?? null,
          emailVerified: userRow?.emailVerified ?? false,
          linkedAccounts,
          totpEnabled,
          passkeys,
        },
      });
    }
  );
};

export default sessionUserRoute;
export const prefixOverride = "/auth/session";
