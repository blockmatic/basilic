import { randomUUID } from "node:crypto";

import type { getDb } from "@repo/db";
import type { SignInMethod } from "@repo/db/schema";
import { sessions } from "@repo/db/schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { env } from "../env.js";
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from "../jwt.js";
import { sessionDeviceFromRequest } from "./device.js";
import { notifyNewDeviceSignIn } from "./notify.js";
import type { SessionNotifyUser } from "./notify.js";
import { loadSessionUser } from "./user.js";

type DbForSession = Pick<
  Awaited<ReturnType<typeof getDb>>,
  "insert" | "select"
>;

export async function createSessionAndIssueTokens({
  fastify,
  db,
  request,
  user,
  signInMethod,
}: {
  fastify: FastifyInstance;
  db: DbForSession;
  request: FastifyRequest;
  user: SessionNotifyUser;
  signInMethod: SignInMethod;
}) {
  const sessionId = randomUUID();
  const refreshJti = generateJti();
  const refreshJtiHash = hashToken(refreshJti);
  const sessionExpiresAt = new Date(
    Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000
  );
  const device = sessionDeviceFromRequest(request);

  await db.insert(sessions).values({
    currentJti: refreshJti,
    deviceFingerprint: device.deviceFingerprint,
    deviceLabel: device.deviceLabel,
    expiresAt: sessionExpiresAt,
    id: sessionId,
    ipAddress: device.ipAddress,
    location: device.location,
    signInMethod,
    token: refreshJtiHash,
    userAgent: device.userAgent,
    userId: user.id,
  });

  await notifyNewDeviceSignIn({
    db,
    deviceFingerprint: device.deviceFingerprint,
    deviceLabel: device.deviceLabel,
    expiresAt: sessionExpiresAt,
    fastify,
    ipAddress: device.ipAddress,
    location: device.location,
    sessionId,
    signInMethod,
    user,
  });

  const accessPayload = createAccessTokenPayload({
    sessionId,
    userId: user.id,
  });
  const refreshPayload = createRefreshTokenPayload({
    jti: refreshJti,
    sessionId,
    userId: user.id,
  });

  const accessToken = fastify.jwt.sign(accessPayload, {
    expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
  });
  const refreshToken = fastify.jwt.sign(refreshPayload, {
    expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
  });

  request.log.info(
    { sessionId, signInMethod, userId: user.id },
    "session_issued"
  );

  return { accessToken, refreshToken };
}

export async function createSessionAndIssueTokensForUserId({
  fastify,
  db,
  request,
  userId,
  signInMethod,
}: {
  fastify: FastifyInstance;
  db: DbForSession;
  request: FastifyRequest;
  userId: string;
  signInMethod: SignInMethod;
}) {
  const user = await loadSessionUser({ db, userId });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return createSessionAndIssueTokens({
    db,
    fastify,
    request,
    signInMethod,
    user,
  });
}
