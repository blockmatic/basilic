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
import { env } from "../../../../lib/env.js";
import { hashToken } from "../../../../lib/jwt.js";
import {
  findOrCreateUserByEmail,
  getOAuthAllowedCallbackUrls,
  validateAndConsumeOAuthState,
} from "../../../../lib/oauth/index.js";
import type { OAuthStateMeta } from "../../../../lib/oauth/index.js";
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

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope?: string;
}

interface GitHubUser {
  id: number;
  login: string;
  email?: string | null;
  name?: string | null;
}
interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export function resolveGitHubVerifiedEmail(emails: GitHubEmail[]): string {
  const primary = emails.find((e) => e.primary && e.verified);
  return primary?.email ?? emails.find((e) => e.verified)?.email ?? "";
}

const oauthExchangeRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/exchange",
    {
      config: authLoginRouteConfig,
      schema: {
        body: ExchangeSchema,
        description: "Exchange GitHub OAuth code for JWTs",
        operationId: "oauthGithubExchange",
        response: {
          200: ExchangeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
          429: RateLimitResponseSchema,
          500: ErrorResponseSchema,
          503: ErrorResponseSchema,
        },
        security: [],
        summary: "GitHub OAuth exchange",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const githubClientId = env.GITHUB_CLIENT_ID;
      const githubClientSecret = env.GITHUB_CLIENT_SECRET;
      const allowedUrls = getOAuthAllowedCallbackUrls({
        singleUrl: env.OAUTH_GITHUB_CALLBACK_URL,
        urls: env.OAUTH_GITHUB_CALLBACK_URLS,
      });
      const defaultUrl = allowedUrls[0];
      if (!githubClientId || !githubClientSecret || !defaultUrl) {
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

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          body: JSON.stringify({
            client_id: githubClientId,
            client_secret: githubClientSecret,
            code,
            redirect_uri: redirectUri,
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      if (!tokenRes.ok) {
        return sendCatalogError({
          reply,
          status: 400,
          code: "TOKEN_EXCHANGE_FAILED",
        });
      }

      const tokenData = (await tokenRes.json()) as GitHubTokenResponse & {
        error?: string;
      };
      if (tokenData.error) {
        return sendCatalogError({
          reply,
          status: 400,
          code: "TOKEN_EXCHANGE_FAILED",
        });
      }

      const accessToken = tokenData.access_token;
      if (!accessToken) {
        return sendCatalogError({
          reply,
          status: 400,
          code: "TOKEN_EXCHANGE_FAILED",
        });
      }

      const [userRes, emailsRes] = await Promise.all([
        fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch("https://api.github.com/user/emails", {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      if (!userRes.ok) {
        return sendCatalogError({
          reply,
          status: 400,
          code: "FETCH_USER_FAILED",
        });
      }

      const ghUser = (await userRes.json()) as GitHubUser;
      const accountId = String(ghUser.id);

      let email: string;
      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as GitHubEmail[];
        email = resolveGitHubVerifiedEmail(emails);
      } else {
        email = "";
      }

      if (!email) {
        return sendCatalogError({ reply, status: 400, code: "EMAIL_REQUIRED" });
      }

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(
          and(
            eq(account.providerId, "github"),
            eq(account.accountId, accountId)
          )
        );

      if (isLinkMode) {
        if (!linkUserId) {
          return sendCatalogError({
            reply,
            status: 401,
            code: "INVALID_STATE",
          });
        }
        if (existingAccount && existingAccount.userId !== linkUserId) {
          return sendCatalogError({
            reply,
            status: 409,
            code: "PROVIDER_ALREADY_LINKED",
          });
        }
      }

      let user: typeof users.$inferSelect | undefined;
      if (isLinkMode && linkUserId) {
        const [u] = await db
          .select()
          .from(users)
          .where(eq(users.id, linkUserId));
        user = u;
        if (!user) {
          return sendCatalogError({
            reply,
            status: 401,
            code: "INVALID_STATE",
          });
        }
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
          name: ghUser.name ?? ghUser.login,
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
        accessToken,
        accessTokenExpiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        accountId,
        id: existingAccount?.id ?? randomUUID(),
        idToken: null as string | null,
        providerId: "github",
        refreshToken: null as string | null,
        refreshTokenExpiresAt: null as Date | null,
        scope: "user:email",
        userId: user.id,
      };

      if (existingAccount) {
        const encrypted = encryptAccountTokens({
          accessToken: accountData.accessToken,
          updatedAt: new Date(),
        });
        await db
          .update(account)
          .set({
            accessToken: encrypted.accessToken,
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

      const { accessToken: jwtAccess, refreshToken: jwtRefresh } =
        await createSessionAndIssueTokens({
          db,
          fastify,
          request,
          signInMethod: "oauth_github",
          user: { email: user.email, id: user.id, name: user.name },
        });

      const payload: {
        token: string;
        refreshToken: string;
        redirectTo?: string;
      } = {
        refreshToken: jwtRefresh,
        token: jwtAccess,
      };
      if (isLinkMode) {
        payload.redirectTo = "/settings?linked=ok";
      }
      return reply.code(200).send(payload);
    }
  );
};

export default oauthExchangeRoute;
export const prefixOverride = "/auth/oauth/github";
