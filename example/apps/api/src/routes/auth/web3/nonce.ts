import { randomUUID } from "node:crypto";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { web3Nonce } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { generateSiweNonce } from "viem/siwe";

import { authLoginRouteConfig } from "../../../lib/auth/index.js";
import { sendCatalogError } from "../../../lib/catalogs/mapper.js";
import { ErrorResponseSchema } from "../../schemas.js";
import { validateAddress } from "./validate-address.js";

const nonceExpiryMinutes = 5;

const NonceResponseSchema = Type.Object({
  nonce: Type.String(),
});

const web3NonceRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get<{
    Querystring: { chain: "eip155" | "solana"; address: string };
  }>(
    "/nonce",
    {
      config: authLoginRouteConfig,
      schema: {
        description: "Get nonce for wallet sign-in or account linking",
        operationId: "web3Nonce",
        querystring: Type.Object({
          chain: Type.Union([Type.Literal("eip155"), Type.Literal("solana")]),
          address: Type.String(),
        }),
        response: {
          200: NonceResponseSchema,
          400: ErrorResponseSchema,
        },
        security: [],
        summary: "Get nonce",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const { chain, address } = request.query;
      const trimmed = address.trim();
      if (!trimmed) {
        return sendCatalogError({
          reply,
          status: 400,
          code: "INVALID_ADDRESS",
        });
      }

      let normalizedAddr: string;
      try {
        normalizedAddr = validateAddress({ address: trimmed, chain });
      } catch {
        return sendCatalogError({
          code: "INVALID_ADDRESS",
          reply,
          status: 400,
        });
      }

      const nonce = generateSiweNonce();
      const expiresAt = new Date(Date.now() + nonceExpiryMinutes * 60 * 1000);

      const db = await getDb();
      await db
        .delete(web3Nonce)
        .where(
          and(eq(web3Nonce.chain, chain), eq(web3Nonce.address, normalizedAddr))
        );
      await db.insert(web3Nonce).values({
        address: normalizedAddr,
        chain,
        expiresAt,
        id: randomUUID(),
        nonce,
      });

      return reply.code(200).send({ nonce });
    }
  );
};

export default web3NonceRoute;
export const prefixOverride = "/auth/web3";
