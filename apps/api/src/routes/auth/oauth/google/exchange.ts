import { randomUUID } from "node:crypto";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { account, users } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { encryptAccountTokens } from "../../../../db/account.js";
import { authLoginRouteConfig } from "../../../../lib/auth/index.js";
import {
  sendCatalogError,
  sendServerCatalogError,
} from "../../../../lib/catalogs/mapper.js";
import type { ErrorCode } from "../../../../lib/catalogs/mapper.js";
import { env } from "../../../../lib/env.js";
import { hashToken } from "../../../../lib/jwt.js";
import {
  buildTokenExchangeError,
  buildUserInfoError,
  fetchGoogleTokens,
  fetchGoogleUserInfo,
  findOrCreateUserByEmail,
  getOAuthAllowedCallbackUrls,
  toAllowedStatus,
  validateAndConsumeOAuthState,
} from "../../../../lib/oauth/index.js";
import type {
  GoogleTokenResponse,
  OAuthStateMeta,
} from "../../../../lib/oauth/index.js";
import { createSessionAndIssueTokens } from "../../../../lib/session/index.js";
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
        description: "Exchange Google OAuth code for JWTs",
        operationId: "oauthGoogleExchange",
        response: {
          200: ExchangeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
          429: RateLimitResponseSchema,
          500: ErrorResponseSchema,
          503: ErrorResponseSchema,
          504: ErrorResponseSchema,
        },
        security: [],
        summary: "Google OAuth exchange",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const googleClientId = env.GOOGLE_CLIENT_ID;
      const googleClientSecret = env.GOOGLE_CLIENT_SECRET;
      const allowedUrls = getOAuthAllowedCallbackUrls({
        singleUrl: env.OAUTH_GOOGLE_CALLBACK_URL,
        urls: env.OAUTH_GOOGLE_CALLBACK_URLS,
      });
      const defaultUrl = allowedUrls[0];
      if (!googleClientId || !googleClientSecret || !defaultUrl) {
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
                message: "Missing code verifier for Google PKCE",
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
      if (isLinkMode && !linkUserId) {
        return sendCatalogError({ reply, status: 401, code: "INVALID_STATE" });
      }
      const meta = stateRecord.meta as OAuthStateMeta | undefined;
      const redirectUri = meta?.redirectUri ?? defaultUrl;
      if (!allowedUrls.includes(redirectUri)) {
        return sendCatalogError({ reply, status: 401, code: "INVALID_STATE" });
      }
      // preConsumeCheck guarantees codeVerifier; this check narrows the type for TS
      const codeVerifier = meta?.codeVerifier;
      if (!codeVerifier) {
        return sendCatalogError({ reply, status: 401, code: "INVALID_STATE" });
      }

      let tokenData: GoogleTokenResponse;
      try {
        tokenData = await fetchGoogleTokens({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          code,
          codeVerifier,
          redirectUri,
        });
      } catch (error) {
        const tokenErr = buildTokenExchangeError(error);
        if (tokenErr)
          return sendCatalogError({
            reply,
            status: toAllowedStatus(
              tokenErr.status ??
                (tokenErr.message.includes("timeout") ? 504 : 400)
            ),
            code: tokenErr.code as ErrorCode,
          });
        throw error;
      }

      let gUser: {
        id: string;
        email?: string;
        name?: string;
        verified_email?: boolean;
      };
      try {
        gUser = await fetchGoogleUserInfo(tokenData.access_token);
      } catch (error) {
        const userErr = buildUserInfoError(error);
        if (userErr)
          return sendCatalogError({
            reply,
            status: toAllowedStatus(
              userErr.status ??
                (userErr.message.includes("timeout") ? 504 : 400)
            ),
            code: userErr.code as ErrorCode,
          });
        throw error;
      }
      const accountId = gUser.id;
      const email = gUser.email ?? "";
      const name = gUser.name ?? "Google user";
      const verifiedEmail = gUser.verified_email ?? false;

      if (!email || !verifiedEmail) {
        return sendCatalogError({ reply, status: 400, code: "EMAIL_REQUIRED" });
      }

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(
          and(
            eq(account.providerId, "google"),
            eq(account.accountId, accountId)
          )
        );

      if (isLinkMode) {
        if (existingAccount && existingAccount.userId !== linkUserId)
          return sendCatalogError({
            reply,
            status: 409,
            code: "PROVIDER_ALREADY_LINKED",
          });
      }

      let user: { id: string; email?: string | null; name?: string | null };
      if (isLinkMode && linkUserId) {
        const [u] = await db
          .select()
          .from(users)
          .where(eq(users.id, linkUserId));
        if (!u) {
          return sendCatalogError({
            reply,
            status: 401,
            code: "INVALID_STATE",
          });
        }
        user = u;
      } else if (existingAccount) {
        const [u] = await db
          .select()
          .from(users)
          .where(eq(users.id, existingAccount.userId));
        if (!u) {
          return sendServerCatalogError({
            request,
            reply,
            code: "USER_NOT_FOUND",
          });
        }
        user = u;
      } else {
        const u = await findOrCreateUserByEmail(db, {
          email,
          emailVerified: true,
          name,
        });
        if (!u) {
          return sendServerCatalogError({
            request,
            reply,
            code: "USER_CREATE_FAILED",
          });
        }
        user = u;
      }

      const accountData = {
        accessToken: tokenData.access_token,
        accessTokenExpiresAt: new Date(
          Date.now() + (tokenData.expires_in ?? 3600) * 1000
        ),
        accountId,
        id: existingAccount?.id ?? randomUUID(),
        idToken: tokenData.id_token ?? null,
        providerId: "google",
        refreshToken: tokenData.refresh_token ?? null,
        refreshTokenExpiresAt: null as Date | null,
        scope: tokenData.scope ?? "openid email profile",
        userId: user.id,
      };

      if (existingAccount) {
        const encrypted = encryptAccountTokens({
          accessToken: accountData.accessToken,
          idToken: accountData.idToken,
          refreshToken: accountData.refreshToken,
          updatedAt: new Date(),
        });
        await db
          .update(account)
          .set({
            accessToken: encrypted.accessToken,
            accessTokenExpiresAt: accountData.accessTokenExpiresAt,
            idToken: encrypted.idToken ?? null,
            refreshToken: tokenData.refresh_token
              ? (encrypted.refreshToken ?? null)
              : existingAccount.refreshToken,
            scope: accountData.scope,
            updatedAt: encrypted.updatedAt ?? new Date(),
          })
          .where(eq(account.id, existingAccount.id));
      } else {
        const toInsert = encryptAccountTokens({
          accessToken: accountData.accessToken,
          accessTokenExpiresAt: accountData.accessTokenExpiresAt,
          accountId: accountData.accountId,
          id: accountData.id,
          idToken: accountData.idToken,
          providerId: accountData.providerId,
          refreshToken: accountData.refreshToken,
          refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
          scope: accountData.scope,
          userId: accountData.userId,
        });
        await db.insert(account).values(toInsert);
      }

      const { accessToken, refreshToken } = await createSessionAndIssueTokens({
        db,
        fastify,
        request,
        signInMethod: "oauth_google",
        user: { email: user.email, id: user.id, name: user.name },
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
export const prefixOverride = "/auth/oauth/google";
