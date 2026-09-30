import { randomUUID } from "node:crypto";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { verification } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { and, eq, gte, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { env } from "../../../../lib/env.js";
import { hashToken } from "../../../../lib/jwt.js";
import {
  getOAuthAllowedCallbackUrls,
  resolveOAuthCallbackUrl,
} from "../../../../lib/oauth/index.js";
import { ErrorResponseSchema } from "../../../schemas.js";

const linkAuthorizeUrlPerUserPerHour = 10;

const AuthorizeUrlResponseSchema = Type.Object({
  redirectUrl: Type.String(),
});

const LinkAuthorizeUrlQuerystringSchema = Type.Object({
  redirect_uri: Type.Optional(Type.String()),
});

const oauthLinkAuthorizeUrlRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    "/link-authorize-url",
    {
      schema: {
        description:
          "Return Facebook OAuth URL for linking account (Bearer required)",
        operationId: "oauthFacebookLinkAuthorizeUrl",
        querystring: LinkAuthorizeUrlQuerystringSchema,
        response: {
          200: AuthorizeUrlResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          429: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Facebook OAuth link authorize URL",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const facebookClientId = env.FACEBOOK_CLIENT_ID;
      const facebookClientSecret = env.FACEBOOK_CLIENT_SECRET;
      const allowedUrls = getOAuthAllowedCallbackUrls({
        singleUrl: env.OAUTH_FACEBOOK_CALLBACK_URL,
        urls: env.OAUTH_FACEBOOK_CALLBACK_URLS,
      });
      const resolved = resolveOAuthCallbackUrl({
        allowedUrls,
        requestedRedirectUri: (request.query as { redirect_uri?: string })
          ?.redirect_uri,
      });
      if (!resolved.ok) {
        return reply
          .status(resolved.error === "NOT_CONFIGURED" ? 503 : 400)
          .send({
            code:
              resolved.error === "NOT_CONFIGURED"
                ? "OAUTH_NOT_CONFIGURED"
                : "INVALID_REDIRECT_URI",
            message:
              resolved.error === "NOT_CONFIGURED"
                ? "Facebook OAuth is not configured"
                : "redirect_uri must be one of the configured callback URLs",
          });
      }
      if (!facebookClientId || !facebookClientSecret) {
        return reply.status(503).send({
          code: "OAUTH_NOT_CONFIGURED",
          message: "Facebook OAuth is not configured",
        });
      }
      const { redirectUri } = resolved;

      const userId = request.session.user.id;
      const db = await getDb();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [recentCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(verification)
        .where(
          and(
            eq(verification.type, "oauth_link_state"),
            eq(verification.identifier, `link:${userId}`),
            gte(verification.createdAt, oneHourAgo)
          )
        );
      if ((recentCount?.count ?? 0) >= linkAuthorizeUrlPerUserPerHour) {
        return reply.code(429).send({
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many link requests. Try again later.",
        });
      }

      const state = randomUUID() + randomUUID().replaceAll("-", "");
      const stateHash = hashToken(state);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db.insert(verification).values({
        expiresAt,
        id: randomUUID(),
        identifier: `link:${userId}`,
        meta: { redirectUri, userId },
        type: "oauth_link_state",
        value: stateHash,
      });

      const redirectUrl = new URL(
        "https://www.facebook.com/v21.0/dialog/oauth"
      );
      redirectUrl.searchParams.set("client_id", facebookClientId);
      redirectUrl.searchParams.set("redirect_uri", redirectUri);
      redirectUrl.searchParams.set("scope", "email,public_profile");
      redirectUrl.searchParams.set("state", state);

      return reply.status(200).send({ redirectUrl: redirectUrl.toString() });
    }
  );
};

export default oauthLinkAuthorizeUrlRoute;
export const prefixOverride = "/auth/oauth/facebook";
