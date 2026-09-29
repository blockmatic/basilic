import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { authLoginRouteConfig } from "../../../../lib/auth/index.js";
import {
  sendCatalogError,
  sendServerCatalogError,
} from "../../../../lib/catalogs/mapper.js";
import { isUniqueViolation } from "../../../../lib/db-errors.js";
import { env } from "../../../../lib/env.js";
import { hashToken } from "../../../../lib/jwt.js";
import {
  fetchTwitterOAuthData,
  getOAuthAllowedCallbackUrls,
  OAuthUpstreamError,
  runTwitterExchangeTx,
  validateAndConsumeOAuthState,
} from "../../../../lib/oauth/index.js";
import type {
  OAuthStateMeta,
  TwitterAccountData,
} from "../../../../lib/oauth/index.js";
import { createSessionAndIssueTokensForUserId } from "../../../../lib/session/index.js";
import {
  ErrorResponseSchema,
  RateLimitResponseSchema,
} from "../../../schemas.js";

const ExchangeSchema = Type.Object({
  code: Type.String(),
  state: Type.String(),
});

const ExchangeResponseSchema = Type.Object({
  redirectTo: Type.Optional(Type.String()),
  refreshToken: Type.String(),
  token: Type.String(),
});

const oauthExchangeRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/exchange",
    {
      config: authLoginRouteConfig,
      schema: {
        body: ExchangeSchema,
        description: "Exchange Twitter/X OAuth code for JWTs (PKCE)",
        operationId: "oauthTwitterExchange",
        response: {
          200: ExchangeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
          429: RateLimitResponseSchema,
          500: ErrorResponseSchema,
          502: ErrorResponseSchema,
          503: ErrorResponseSchema,
          504: ErrorResponseSchema,
        },
        security: [],
        summary: "Twitter OAuth exchange",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const twitterClientId = env.TWITTER_CLIENT_ID;
      const twitterClientSecret = env.TWITTER_CLIENT_SECRET;
      const allowedUrls = getOAuthAllowedCallbackUrls({
        singleUrl: env.OAUTH_TWITTER_CALLBACK_URL,
        urls: env.OAUTH_TWITTER_CALLBACK_URLS,
      });
      const defaultUrl = allowedUrls[0];
      if (!twitterClientId || !twitterClientSecret || !defaultUrl) {
        return sendCatalogError({
          reply,
          status: 503,
          code: "OAUTH_NOT_CONFIGURED",
        });
      }

      const { code, state } = request.body;
      const stateHash = hashToken(state);

      const db = await getDb();
      const validated = await validateAndConsumeOAuthState({
        db,
        preConsumeCheck: (r) =>
          !r.meta?.codeVerifier
            ? {
                code: "INVALID_STATE",
                message: "Missing code verifier for Twitter PKCE",
              }
            : null,
        reply,
        request,
        stateHash,
      });
      if (!validated.ok) {
        return;
      }
      const { isLinkMode, linkUserId, stateRecord } = validated;
      const meta = stateRecord.meta as OAuthStateMeta | undefined;
      const redirectUri = meta?.redirectUri ?? defaultUrl;
      if (!allowedUrls.includes(redirectUri)) {
        return sendCatalogError({ reply, status: 401, code: "INVALID_STATE" });
      }
      const codeVerifier = meta?.codeVerifier;
      if (!codeVerifier) {
        return sendCatalogError({ reply, status: 401, code: "INVALID_STATE" });
      }

      let accountId: string;
      let name: string;
      let accountData: TwitterAccountData;
      try {
        const oauthData = await fetchTwitterOAuthData({
          code,
          codeVerifier,
          redirectUri,
          twitterClientId,
          twitterClientSecret,
        });
        accountId = oauthData.accountId;
        name = oauthData.name;
        accountData = oauthData.accountData;
      } catch (error) {
        if (
          error instanceof Error &&
          (error.name === "AbortError" || error.name === "TimeoutError")
        )
          return sendCatalogError({
            reply,
            status: 504,
            code: "UPSTREAM_TIMEOUT",
          });
        if (error instanceof OAuthUpstreamError) {
          const is4xx = error.status >= 400 && error.status < 500;
          const errorCode =
            error.stage === "user_fetch"
              ? "FETCH_USER_FAILED"
              : "UPSTREAM_SERVICE_ERROR";
          const statusCode: 400 | 401 | 502 =
            is4xx && error.status === 401 ? 401 : is4xx ? 400 : 502;
          return sendCatalogError({
            reply,
            status: statusCode,
            code: errorCode,
          });
        }
        request.log.warn({ error }, "Twitter OAuth fetch failed");
        return sendCatalogError({
          code: "UPSTREAM_SERVICE_ERROR",
          reply,
          status: 502,
        });
      }

      const maxRetries = 5;
      let txResult!: { userId: string };
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          txResult = await runTwitterExchangeTx({
            db,
            accountId,
            name,
            accountData,
            ...(isLinkMode && linkUserId && { linkUserId }),
          });
          break;
        } catch (err) {
          if (err instanceof Error && err.message === "PROVIDER_ALREADY_LINKED")
            return sendCatalogError({
              reply,
              status: 409,
              code: "PROVIDER_ALREADY_LINKED",
            });
          if (err instanceof Error && err.message === "USER_NOT_FOUND")
            return sendCatalogError({
              reply,
              status: 401,
              code: "INVALID_STATE",
            });
          if (err instanceof Error && err.message === "USER_CREATE_FAILED")
            return sendServerCatalogError({
              request,
              reply,
              code: "USER_CREATE_FAILED",
              error: err,
            });
          if (isUniqueViolation(err) && attempt < maxRetries - 1) continue;
          throw err;
        }
      }

      const { accessToken, refreshToken } =
        await createSessionAndIssueTokensForUserId({
          db,
          fastify,
          request,
          signInMethod: "oauth_twitter",
          userId: txResult.userId,
        });

      const payload: {
        token: string;
        refreshToken: string;
        redirectTo?: string;
      } = {
        refreshToken,
        token: accessToken,
      };
      if (isLinkMode) {
        payload.redirectTo = "/settings?linked=ok";
      }
      return reply.code(200).send(payload);
    }
  );
};

export default oauthExchangeRoute;
export const prefixOverride = "/auth/oauth/twitter";
