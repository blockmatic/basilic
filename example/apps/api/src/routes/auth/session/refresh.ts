import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { sessions } from "@repo/db/schema";
import { captureError } from "@repo/error/node";
import { Type } from "@sinclair/typebox";
import { and, eq, gt } from "drizzle-orm";
import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
} from "fastify";

import { sendCatalogError } from "../../../lib/catalogs/mapper.js";
import { env } from "../../../lib/env.js";
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from "../../../lib/jwt.js";
import { ErrorResponseSchema } from "../../schemas.js";

const RefreshSchema = Type.Object({
  refreshToken: Type.String({ minLength: 1 }),
});

const RefreshResponseSchema = Type.Object({
  refreshToken: Type.String(),
  token: Type.String(),
});

function signSessionTokens({
  fastify,
  userId,
  sessionId,
  refreshJti,
  wallet,
}: {
  fastify: FastifyInstance;
  userId: string;
  sessionId: string;
  refreshJti: string;
  wallet?: { chain: string; address: string };
}) {
  const accessPayload = createAccessTokenPayload({ sessionId, userId, wallet });
  const refreshPayload = createRefreshTokenPayload({
    jti: refreshJti,
    sessionId,
    userId,
  });
  return {
    refreshToken: fastify.jwt.sign(refreshPayload, {
      expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
    }),
    token: fastify.jwt.sign(accessPayload, {
      expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
    }),
  };
}

function sessionWallet(session: {
  walletChain: string | null;
  walletAddress: string | null;
}) {
  return session.walletChain && session.walletAddress
    ? { address: session.walletAddress, chain: session.walletChain }
    : undefined;
}

function isWithinReuseGrace({
  rotatedAt,
  now,
}: {
  rotatedAt: Date | null;
  now: Date;
}) {
  if (!rotatedAt) {
    return false;
  }
  return (
    now.getTime() - rotatedAt.getTime() < env.REFRESH_REUSE_GRACE_SECONDS * 1000
  );
}

async function sendReuseDetected({
  reply,
  requestUrl,
  logger,
  sessionId,
  userId,
}: {
  reply: FastifyReply;
  requestUrl: string;
  logger: FastifyBaseLogger;
  sessionId: string;
  userId: string;
}) {
  const db = await getDb();
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  captureError({
    code: "SECURITY_VIOLATION",
    data: { sessionId, userId },
    error: new Error("Refresh token reuse detected"),
    label: "refresh token reuse detected",
    logger,
    tags: {
      app: "api",
      module: "auth-service",
      route: requestUrl,
      security: "token-reuse",
    },
  });
  return sendCatalogError({ code: "TOKEN_REUSE_DETECTED", reply, status: 401 });
}

const sessionRefreshRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/refresh",
    {
      schema: {
        body: RefreshSchema,
        description: "Refresh access token",
        operationId: "refresh",
        response: {
          200: RefreshResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
        security: [],
        summary: "Refresh token",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const { refreshToken: refreshTokenInput } = request.body;

      let decoded: {
        typ?: string;
        sub?: string;
        sid?: string;
        jti?: string;
      };
      try {
        decoded = fastify.jwt.verify<typeof decoded>(refreshTokenInput);
      } catch {
        return sendCatalogError({ code: "INVALID_TOKEN", reply, status: 401 });
      }

      if (
        decoded.typ !== "refresh" ||
        !decoded.sub ||
        !decoded.sid ||
        !decoded.jti
      ) {
        return sendCatalogError({ reply, status: 401, code: "INVALID_TOKEN" });
      }

      const db = await getDb();
      const now = new Date();
      const jtiHash = hashToken(decoded.jti);
      const newRefreshJti = generateJti();
      const newRefreshJtiHash = hashToken(newRefreshJti);
      const newSessionExpiresAt = new Date(
        Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000
      );

      const [rotated] = await db
        .update(sessions)
        .set({
          currentJti: newRefreshJti,
          expiresAt: newSessionExpiresAt,
          previousToken: jtiHash,
          rotatedAt: now,
          token: newRefreshJtiHash,
        })
        .where(
          and(
            eq(sessions.id, decoded.sid),
            eq(sessions.token, jtiHash),
            eq(sessions.userId, decoded.sub),
            gt(sessions.expiresAt, now)
          )
        )
        .returning();

      if (rotated) {
        const tokens = signSessionTokens({
          fastify,
          refreshJti: newRefreshJti,
          sessionId: decoded.sid,
          userId: decoded.sub,
          wallet: sessionWallet(rotated),
        });
        return reply.code(200).send(tokens);
      }

      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, decoded.sid));

      if (!session) {
        return sendCatalogError({
          reply,
          status: 401,
          code: "SESSION_NOT_FOUND",
        });
      }

      if (session.expiresAt < now) {
        await db.delete(sessions).where(eq(sessions.id, session.id));
        return sendCatalogError({ code: "EXPIRED_TOKEN", reply, status: 401 });
      }

      if (session.userId !== decoded.sub) {
        await db.delete(sessions).where(eq(sessions.id, session.id));
        return sendCatalogError({ code: "INVALID_TOKEN", reply, status: 401 });
      }

      if (
        session.previousToken === jtiHash &&
        session.currentJti &&
        isWithinReuseGrace({ now, rotatedAt: session.rotatedAt })
      ) {
        const tokens = signSessionTokens({
          fastify,
          refreshJti: session.currentJti,
          sessionId: decoded.sid,
          userId: decoded.sub,
          wallet: sessionWallet(session),
        });
        return reply.code(200).send(tokens);
      }

      return sendReuseDetected({
        logger: request.log,
        reply,
        requestUrl: request.url,
        sessionId: decoded.sid,
        userId: decoded.sub,
      });
    }
  );
};

export default sessionRefreshRoute;
export const prefixOverride = "/auth/session";
