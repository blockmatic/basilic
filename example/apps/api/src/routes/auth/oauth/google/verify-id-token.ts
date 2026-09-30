import { randomUUID } from "node:crypto";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { account } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRequest,
} from "fastify";
import { OAuth2Client } from "google-auth-library";

import { authLoginRouteConfig } from "../../../../lib/auth/index.js";
import { env } from "../../../../lib/env.js";
import { findOrCreateUserByEmail } from "../../../../lib/oauth/index.js";
import { createSessionAndIssueTokens } from "../../../../lib/session/index.js";
import {
  ErrorResponseSchema,
  RateLimitResponseSchema,
} from "../../../schemas.js";

const VerifyIdTokenSchema = Type.Object({
  credential: Type.String(),
});

const VerifyIdTokenResponseSchema = Type.Object({
  refreshToken: Type.String(),
  token: Type.String(),
});

async function runGoogleVerifyIdTokenTx(input: {
  fastify: FastifyInstance;
  db: Awaited<ReturnType<typeof getDb>>;
  request: FastifyRequest;
  accountId: string;
  email: string;
  name: string;
}): Promise<{ token: string; refreshToken: string }> {
  const { fastify, db, request, accountId, email, name } = input;
  const user = await findOrCreateUserByEmail(db, {
    email,
    emailVerified: true,
    name,
  });
  if (!user) {
    throw new Error("Failed to create or find user");
  }

  return db.transaction(async (tx) => {
    const linkedUserId = user.id;
    const now = new Date();
    await tx
      .insert(account)
      .values({
        accountId,
        id: randomUUID(),
        providerId: "google",
        scope: "openid email profile",
        userId: linkedUserId,
      })
      .onConflictDoUpdate({
        set: { updatedAt: now, userId: linkedUserId },
        target: [account.providerId, account.accountId],
      });

    const { accessToken, refreshToken } = await createSessionAndIssueTokens({
      db: tx,
      fastify,
      request,
      signInMethod: "oauth_google",
      user: { email: user.email, id: user.id, name: user.name },
    });
    return { refreshToken, token: accessToken };
  });
}

const oauthVerifyIdTokenRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/verify-id-token",
    {
      config: authLoginRouteConfig,
      schema: {
        body: VerifyIdTokenSchema,
        description: "Verify Google One Tap ID token and issue JWTs",
        operationId: "oauthGoogleVerifyIdToken",
        response: {
          200: VerifyIdTokenResponseSchema,
          400: ErrorResponseSchema,
          429: RateLimitResponseSchema,
          503: ErrorResponseSchema,
        },
        security: [],
        summary: "Google OAuth verify ID token",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const googleClientId = env.GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        return reply.code(503).send({
          code: "OAUTH_NOT_CONFIGURED",
          message: "Google OAuth is not configured",
        });
      }

      const { credential } = request.body;

      const client = new OAuth2Client(googleClientId);
      let payload: {
        sub: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
      };
      try {
        const ticket = await client.verifyIdToken({
          audience: googleClientId,
          idToken: credential,
        });
        const p = ticket.getPayload();
        if (!p?.sub) {
          return reply.code(400).send({
            code: "INVALID_CREDENTIAL",
            message: "Invalid Google ID token",
          });
        }
        payload = p;
      } catch {
        return reply.code(400).send({
          code: "INVALID_CREDENTIAL",
          message: "Failed to verify Google ID token",
        });
      }

      const accountId = payload.sub;
      const email = payload.email ?? "";
      const emailVerified = !!payload.email_verified;
      if (!emailVerified || !email) {
        return reply.code(400).send({
          code: "EMAIL_NOT_VERIFIED",
          message: "Could not retrieve verified email from Google",
        });
      }

      const db = await getDb();
      const name = payload.name ?? email;
      const result = await runGoogleVerifyIdTokenTx({
        accountId,
        db,
        email,
        fastify,
        name,
        request,
      });
      return reply
        .code(200)
        .send({ refreshToken: result.refreshToken, token: result.token });
    }
  );
};

export default oauthVerifyIdTokenRoute;
export const prefixOverride = "/auth/oauth/google";
