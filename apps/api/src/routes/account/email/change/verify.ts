import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { getDb } from "@repo/db";
import { authAttempts, sessions, users, verification } from "@repo/db/schema";
import EmailChangedNotification from "@repo/email/emails/email-changed-notification";
import { render } from "@repo/email/render";
import { Type } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

import { recordAuthFailedAttempt } from "../../../../lib/auth/index.js";
import {
  logAuthLocked,
  logAuthVerifyFailed,
} from "../../../../lib/auth/signals.js";
import { normalizeEmail, sendMail } from "../../../../lib/email.js";
import { env } from "../../../../lib/env.js";
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashLoginCode,
  hashToken,
} from "../../../../lib/jwt.js";
import { getTrustedClientIp } from "../../../../lib/request.js";
import { webAppPathUrl } from "../../../../lib/session/index.js";
import { ErrorResponseSchema } from "../../../schemas.js";

const changeEmailMaxAttempts = 5;
const changeEmailLockMinutes = 15;

const recordChangeEmailFailedAttempt = (
  db: Awaited<ReturnType<typeof getDb>>,
  ip: string
) =>
  recordAuthFailedAttempt({
    db,
    ip,
    lockMinutes: changeEmailLockMinutes,
    maxAttempts: changeEmailMaxAttempts,
    type: "change_email",
  });

const VerifySchema = Type.Object({
  email: Type.Optional(
    Type.String({
      format: "email",
      description: "For code entry (must match request)",
    })
  ),
  token: Type.String({ pattern: "^\\d{6}$", description: "6-digit code" }),
  verificationId: Type.Optional(
    Type.String({ format: "uuid", description: "For link click" })
  ),
});

const VerifyResponseSchema = Type.Object({
  refreshToken: Type.String(),
  token: Type.String(),
});

function discriminate(body: {
  token?: string;
  email?: string;
  verificationId?: string;
}): "code" | "link" | "invalid" {
  const hasEmail = Boolean(body.email);
  const hasVerificationId = Boolean(body.verificationId);
  if (hasEmail && !hasVerificationId) {
    return "code";
  }
  if (hasVerificationId && !hasEmail) {
    return "link";
  }
  return "invalid";
}

const changeEmailVerifyRoute: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/verify",
    {
      schema: {
        body: VerifySchema,
        description:
          "Verify change email token (6-digit code) and update user email",
        operationId: "accountEmailChangeVerify",
        response: {
          200: VerifyResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          429: ErrorResponseSchema,
        },
        security: [{ bearerAuth: [] }],
        summary: "Change email verify",
        tags: ["account"],
      },
    },
    async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const { body } = request;
      const mode = discriminate(body);
      if (mode === "invalid") {
        return reply.code(400).send({
          code: "INVALID_PAYLOAD",
          message:
            "Provide exactly one of { token, email } or { token, verificationId }",
        });
      }

      const { token } = body;
      const tokenHash = hashLoginCode(token);
      const db = await getDb();
      const ip = getTrustedClientIp(request);
      const userId = request.session.user.id;

      const [attemptRow] = await db
        .select()
        .from(authAttempts)
        .where(
          and(eq(authAttempts.key, ip), eq(authAttempts.type, "change_email"))
        );

      if (attemptRow?.lockedUntil && attemptRow.lockedUntil > new Date()) {
        logAuthLocked({
          code: "TOO_MANY_ATTEMPTS",
          request,
          signInMethod: "change_email",
        });
        return reply.code(429).send({
          code: "TOO_MANY_ATTEMPTS",
          message: "Too many failed attempts. Try again later.",
        });
      }

      let verificationWhere: ReturnType<typeof and>;
      if (mode === "link" && body.verificationId) {
        verificationWhere = and(
          eq(verification.id, body.verificationId),
          eq(verification.value, tokenHash),
          eq(verification.type, "change_email")
        );
      } else if (mode === "code" && body.email) {
        verificationWhere = and(
          eq(
            verification.identifier,
            `${userId}:${normalizeEmail(body.email)}`
          ),
          eq(verification.value, tokenHash),
          eq(verification.type, "change_email")
        );
      } else {
        return reply.code(400).send({
          code: "INVALID_PAYLOAD",
          message:
            "Provide exactly one of { token, email } or { token, verificationId }",
        });
      }

      const [verificationRecord] = await db
        .select()
        .from(verification)
        .where(verificationWhere);

      if (!verificationRecord) {
        await recordChangeEmailFailedAttempt(db, ip);
        logAuthVerifyFailed({
          code: "INVALID_TOKEN",
          request,
          signInMethod: "change_email",
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
        await recordChangeEmailFailedAttempt(db, ip);
        logAuthVerifyFailed({
          code: "EXPIRED_TOKEN",
          request,
          signInMethod: "change_email",
        });
        return reply.code(401).send({
          code: "EXPIRED_TOKEN",
          message: "Token has expired",
        });
      }

      const parts = verificationRecord.identifier.split(":");
      const targetUserId = parts[0];
      const newEmail = parts.slice(1).join(":");
      if (targetUserId !== userId) {
        logAuthVerifyFailed({
          code: "INVALID_TOKEN",
          request,
          signInMethod: "change_email",
        });
        return reply.code(401).send({
          code: "INVALID_TOKEN",
          message: "Token does not match current session",
        });
      }

      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      const oldEmail = userRow?.email ?? null;

      const sessionId = request.session.session.id;
      const refreshJti = generateJti();
      const refreshJtiHash = hashToken(refreshJti);
      const sessionExpiresAt = new Date(
        Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000
      );

      await db.transaction(async (tx) => {
        await tx
          .delete(verification)
          .where(eq(verification.id, verificationRecord.id));
        await tx
          .update(users)
          .set({ email: newEmail, emailVerified: true, updatedAt: new Date() })
          .where(eq(users.id, userId));
        await tx
          .update(sessions)
          .set({ expiresAt: sessionExpiresAt, token: refreshJtiHash })
          .where(eq(sessions.id, sessionId));
      });

      await db
        .delete(authAttempts)
        .where(
          and(eq(authAttempts.key, ip), eq(authAttempts.type, "change_email"))
        );

      if (oldEmail && oldEmail !== newEmail) {
        const html = await render(
          EmailChangedNotification({
            appName: env.APP_NAME,
            fullName: userRow?.name ?? undefined,
            newEmail,
            sessionsUrl: webAppPathUrl("/settings/security/sessions"),
          })
        );
        void sendMail({
          logger: request.log,
          message: {
            from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
            html,
            subject: `Your email was changed - ${env.APP_NAME}`,
            to: oldEmail,
          },
          mode: "fireAndForget",
          provider: fastify.emailProvider,
        });
      }

      const accessPayload = createAccessTokenPayload({ sessionId, userId });
      const refreshPayload = createRefreshTokenPayload({
        jti: refreshJti,
        sessionId,
        userId,
      });

      const accessToken = fastify.jwt.sign(accessPayload, {
        expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
      });
      const refreshToken = fastify.jwt.sign(refreshPayload, {
        expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
      });

      return reply.code(200).send({ refreshToken, token: accessToken });
    }
  );
};

export default changeEmailVerifyRoute;
export const prefixOverride = "/account/email/change";
