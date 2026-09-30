import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { sendCatalogError } from "../../../lib/catalogs/mapper.js";
import { composeOwnWallet } from "../../../lib/wallet/compose.js";
import { ErrorResponseSchema } from "../../schemas.js";

const nullableString = Type.Union([Type.String(), Type.Null()]);
const nullableNumber = Type.Union([Type.Number(), Type.Null()]);

const WalletTokenSchema = Type.Object({
  amount: Type.String(),
  assetId: nullableString,
  logoUrl: nullableString,
  name: nullableString,
  network: Type.Union([
    Type.Literal("eth-mainnet"),
    Type.Literal("base-mainnet"),
  ]),
  quoteUsd: nullableNumber,
  symbol: nullableString,
  tokenAddress: nullableString,
});

const WalletNftSchema = Type.Object({
  collectionName: nullableString,
  contractAddress: Type.String(),
  imageUrl: nullableString,
  name: nullableString,
  network: Type.Union([
    Type.Literal("eth-mainnet"),
    Type.Literal("base-mainnet"),
  ]),
  tokenId: Type.String(),
});

const WalletResponseSchema = Type.Object({
  address: nullableString,
  error: nullableString,
  nfts: Type.Array(WalletNftSchema),
  tokens: Type.Array(WalletTokenSchema),
});

const accountWalletGetRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/",
    {
      schema: {
        description:
          "Live Alchemy Portfolio for the access JWT user linked eip155 address. Empty when unlinked or key unset.",
        operationId: "accountWalletGet",
        response: {
          200: WalletResponseSchema,
          401: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Get linked wallet holdings",
        tags: ["account"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return sendCatalogError({ reply, status: 401, code: "UNAUTHORIZED" });
      }
      return reply
        .code(200)
        .send(await composeOwnWallet({ userId: request.session.user.id }));
    }
  );
};

export default accountWalletGetRoute;
export const prefixOverride = "/account/wallet";
