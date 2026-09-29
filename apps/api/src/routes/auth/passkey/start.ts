import { randomUUID } from "node:crypto";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { passkeyAuthChallenges } from "@repo/db/schema";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { authLoginRouteConfig } from "../../../lib/auth/index.js";
import {
  getWebAuthnOriginFromRequest,
  PublicKeyCredentialRequestOptionsJSONSchema,
} from "../../../lib/passkey/index.js";
import { ErrorResponseSchema, RateLimitResponseSchema } from "../../schemas.js";

const challengeMaxAge = 5 * 60; // 5 minutes

const StartResponseSchema = Type.Object({
  options: PublicKeyCredentialRequestOptionsJSONSchema,
  sessionId: Type.String(),
});

const passkeyStartRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/start",
    {
      config: authLoginRouteConfig,
      schema: {
        description:
          "Start passkey authentication, returns options for startAuthentication",
        operationId: "authPasskeyStart",
        response: {
          200: StartResponseSchema,
          400: ErrorResponseSchema,
          429: RateLimitResponseSchema,
        },
        security: [],
        summary: "Passkey auth start",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const origin = getWebAuthnOriginFromRequest(request.headers.origin);
      if (!origin) {
        return reply.code(400).send({
          code: "INVALID_ORIGIN",
          message: "Invalid or missing Origin header",
        });
      }

      const sessionId = randomUUID();
      const options = await generateAuthenticationOptions({
        allowCredentials: [],
        rpID: origin.rpID,
        userVerification: "required",
      });

      const db = await getDb();
      const challengeStr =
        typeof options.challenge === "string"
          ? options.challenge
          : Buffer.from(options.challenge).toString("base64url");
      const expiresAt = new Date(Date.now() + challengeMaxAge * 1000);
      await db.insert(passkeyAuthChallenges).values({
        challenge: challengeStr,
        expiresAt,
        id: randomUUID(),
        sessionId,
      });

      return reply.code(200).send({
        options: options as Static<
          typeof PublicKeyCredentialRequestOptionsJSONSchema
        >,
        sessionId,
      });
    }
  );
};

export default passkeyStartRoute;
export const prefixOverride = "/auth/passkey";
