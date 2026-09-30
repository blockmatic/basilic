import { randomBytes, randomUUID } from "node:crypto";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { web3Nonce } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { authLoginRouteConfig } from "../../../../lib/auth/index.js";
import { sendCatalogError } from "../../../../lib/catalogs/mapper.js";
import { ErrorResponseSchema } from "../../../schemas.js";
import { validateAddress } from "../validate-address.js";

const nonceTtlMs = 5 * 60 * 1000; // 5 minutes

const NonceResponseSchema = Type.Object({
  nonce: Type.String(),
});

const eip155NonceRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/nonce",
    {
      config: authLoginRouteConfig,
      schema: {
        description: "Get nonce for SIWE (Sign-In with Ethereum)",
        operationId: "web3Eip155Nonce",
        querystring: Type.Object({
          address: Type.String({ minLength: 1 }),
        }),
        response: {
          200: NonceResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
        security: [],
        summary: "Get EIP-155 nonce",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const { address } = request.query as { address: string };
      const chain = "eip155";

      let validatedAddress: string;
      try {
        validatedAddress = validateAddress({ address, chain });
      } catch {
        return sendCatalogError({
          code: "INVALID_ADDRESS",
          reply,
          status: 400,
        });
      }

      const nonce = randomBytes(16).toString("hex");
      const expiresAt = new Date(Date.now() + nonceTtlMs);
      const db = await getDb();

      await db
        .delete(web3Nonce)
        .where(
          and(
            eq(web3Nonce.chain, chain),
            eq(web3Nonce.address, validatedAddress)
          )
        );

      await db.insert(web3Nonce).values({
        address: validatedAddress,
        chain,
        expiresAt,
        id: randomUUID(),
        nonce,
      });

      return reply.code(200).send({ nonce });
    }
  );
};

export default eip155NonceRoute;
export const prefixOverride = "/auth/web3/eip155";
