import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { authAttempts, users, verification } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRequest,
} from "fastify";

import { recordAuthFailedAttempt } from "../../../lib/auth/index.js";
import {
  logAuthLocked,
  logAuthVerifyFailed,
} from "../../../lib/auth/signals.js";
import { sendServerCatalogError } from "../../../lib/catalogs/mapper.js";
import { findUserByNormalizedEmail } from "../../../lib/email-identity.js";
import { normalizeEmail } from "../../../lib/email.js";
import { hashLoginCode } from "../../../lib/jwt.js";
import { getTrustedClientIp } from "../../../lib/request.js";
import { createSessionAndIssueTokens } from "../../../lib/session/index.js";
import { ErrorResponseSchema } from "../../schemas.js";

const magicLinkMaxAttempts = 5;
const magicLinkLockMinutes = 15;

const recordMagicLinkFailedAttempt = (
  db: Awaited<ReturnType<typeof getDb>>,
  ip: string
) =>
  recordAuthFailedAttempt({
    db,
    ip,
    lockMinutes: magicLinkLockMinutes,
    maxAttempts: magicLinkMaxAttempts,
    type: "magic_link",
  });

/** Verify magic link token and return access JWT. Used by reference route callback and POST /verify. */
export async function verifyMagicLinkAndIssueToken(
  fastify: FastifyInstance,
  request: FastifyRequest,
  { token, verificationId }: { token: string; verificationId: string }
): Promise<{ accessToken: string } | { collision: true } | null> {
  const tokenHash = hashLoginCode(token);
  const db = await getDb();
  const ip = getTrustedClientIp(request);

  const [attemptRow] = await db
    .select()
    .from(authAttempts)
    .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, "magic_link")));

  if (attemptRow?.lockedUntil && attemptRow.lockedUntil > new Date()) {
    return null;
  }

  const [verificationRecord] = await db
    .select()
    .from(verification)
    .where(
      and(
        eq(verification.id, verificationId),
        eq(verification.value, tokenHash),
        eq(verification.type, "magic_link")
      )
    );

  if (!verificationRecord) {
    await recordMagicLinkFailedAttempt(db, ip);
    return null;
  }

  if (verificationRecord.expiresAt < new Date()) {
    await db
      .delete(verification)
      .where(eq(verification.id, verificationRecord.id));
    await recordMagicLinkFailedAttempt(db, ip);
    return null;
  }

  const lookup = await findUserByNormalizedEmail({
    db,
    email: verificationRecord.identifier,
  });
  if (lookup.status === "collision") {
    return { collision: true };
  }
  const { user } = lookup;
  if (!user) {
    return null;
  }

  await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await db
    .delete(authAttempts)
    .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, "magic_link")));
  await db
    .delete(verification)
    .where(eq(verification.id, verificationRecord.id));

  const { accessToken } = await createSessionAndIssueTokens({
    db,
    fastify,
    request,
    signInMethod: "magic_link",
    user: { email: user.email, id: user.id, name: user.name },
  });
  return { accessToken };
}

const VerifySchema = Type.Object({
  email: Type.Optional(
    Type.String({
      format: "email",
      description: "Email (for code entry on login page)",
    })
  ),
  token: Type.String({ pattern: "^\\d{6}$", description: "6-digit code" }),
  verificationId: Type.Optional(
    Type.String({
      format: "uuid",
      description: "Verification row id (from magic link URL)",
    })
  ),
});

const VerifyResponseSchema = Type.Object({
  refreshToken: Type.String(),
  token: Type.String(),
});

const magicLinkVerifyRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/verify",
    {
      schema: {
        body: VerifySchema,
        description: "Verify magic link token and return JWTs",
        operationId: "magiclinkVerify",
        response: {
          200: VerifyResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          429: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
        security: [],
        summary: "Verify magic link",
        tags: ["auth"],
      },
    },
    async (request, reply) => {
      const { token, verificationId, email } = request.body;
      const hasVerificationId = Boolean(verificationId);
      const hasEmail = Boolean(email);
      if (hasVerificationId === hasEmail) {
        return reply.code(400).send({
          code: "INVALID_INPUT",
          message:
            "Provide exactly one of verificationId (from link) or email (for code entry)",
        });
      }

      const tokenHash = hashLoginCode(token);
      const db = await getDb();
      const ip = getTrustedClientIp(request);

      const [attemptRow] = await db
        .select()
        .from(authAttempts)
        .where(
          and(eq(authAttempts.key, ip), eq(authAttempts.type, "magic_link"))
        );

      if (attemptRow?.lockedUntil && attemptRow.lockedUntil > new Date()) {
        logAuthLocked({
          code: "TOO_MANY_ATTEMPTS",
          request,
          signInMethod: "magic_link",
        });
        return reply.code(429).send({
          code: "TOO_MANY_ATTEMPTS",
          message: "Too many failed attempts. Try again later.",
        });
      }

      const idOrEmail = (hasVerificationId ? verificationId : email) ?? "";
      const verificationWhere = hasVerificationId
        ? and(
            eq(verification.id, idOrEmail),
            eq(verification.value, tokenHash),
            eq(verification.type, "magic_link")
          )
        : and(
            eq(verification.identifier, normalizeEmail(idOrEmail)),
            eq(verification.value, tokenHash),
            eq(verification.type, "magic_link")
          );
      const [verificationRecord] = await db
        .select()
        .from(verification)
        .where(verificationWhere);

      if (!verificationRecord) {
        await recordMagicLinkFailedAttempt(db, ip);
        logAuthVerifyFailed({
          code: "INVALID_TOKEN",
          request,
          signInMethod: "magic_link",
        });
        return reply.code(401).send({
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        });
      }

      if (verificationRecord.expiresAt < new Date()) {
        await db
          .delete(verification)
          .where(eq(verification.id, verificationRecord.id));
        await recordMagicLinkFailedAttempt(db, ip);
        logAuthVerifyFailed({
          code: "EXPIRED_TOKEN",
          request,
          signInMethod: "magic_link",
        });
        return reply.code(401).send({
          code: "EXPIRED_TOKEN",
          message: "Token has expired",
        });
      }

      const lookup = await findUserByNormalizedEmail({
        db,
        email: verificationRecord.identifier,
      });
      if (lookup.status === "collision") {
        return sendServerCatalogError({
          request,
          reply,
          code: "UNEXPECTED_ERROR",
        });
      }
      const { user } = lookup;
      if (!user) {
        return reply.code(404).send({
          code: "USER_NOT_FOUND",
          message: "User not found",
        });
      }

      await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      await db
        .delete(authAttempts)
        .where(
          and(eq(authAttempts.key, ip), eq(authAttempts.type, "magic_link"))
        );

      await db
        .delete(verification)
        .where(eq(verification.id, verificationRecord.id));

      const { accessToken, refreshToken } = await createSessionAndIssueTokens({
        db,
        fastify,
        request,
        signInMethod: "magic_link",
        user: { email: user.email, id: user.id, name: user.name },
      });

      return reply.code(200).send({
        refreshToken,
        token: accessToken,
      });
    }
  );
};

export default magicLinkVerifyRoute;
export const prefixOverride = "/auth/magiclink";
