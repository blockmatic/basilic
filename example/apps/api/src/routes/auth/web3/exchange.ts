import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { web3Callback } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { and, eq, gt } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { decryptCallbackTokens } from "../../../db/callback-tokens.js";
import { authLoginRouteConfig } from "../../../lib/auth/index.js";
import { sendCatalogError } from "../../../lib/catalogs/mapper.js";
import { hashToken } from "../../../lib/jwt.js";
import { ErrorResponseSchema } from "../../schemas.js";

const ExchangeSchema = Type.Object({
  code: Type.String(),
});

const ExchangeResponseSchema = Type.Object({
  refreshToken: Type.String(),
  token: Type.String(),
});

const web3ExchangeRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/exchange",
    {
      config: authLoginRouteConfig,
      schema: {
        body: ExchangeSchema,
        description: "Exchange one-time code for tokens (redirect flow)",
        operationId: "web3Exchange",
        response: {
          200: ExchangeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
        security: [],
        summary: "Exchange code for tokens",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const { code } = request.body;

      if (!code?.trim()) {
        return sendCatalogError({ reply, status: 400, code: "MISSING_CODE" });
      }

      const codeHash = hashToken(code.trim());
      const db = await getDb();
      const now = new Date();

      const [row] = await db
        .delete(web3Callback)
        .where(
          and(
            eq(web3Callback.codeHash, codeHash),
            gt(web3Callback.expiresAt, now)
          )
        )
        .returning();

      if (!row) {
        return sendCatalogError({
          reply,
          status: 401,
          code: "INVALID_OR_EXPIRED_CODE",
        });
      }

      const tokens = decryptCallbackTokens(row);
      if (!tokens) {
        return sendCatalogError({
          reply,
          status: 401,
          code: "INVALID_OR_EXPIRED_CODE",
        });
      }

      return reply.code(200).send({
        refreshToken: tokens.refreshToken,
        token: tokens.accessToken,
      });
    }
  );
};

export default web3ExchangeRoute;
export const prefixOverride = "/auth/web3";
