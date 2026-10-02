import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";

import { env } from "./env.js";

interface AccessTokenPayload {
  typ: "access";
  sub: string; // userId
  sid: string; // sessionId
  iss: string;
  aud: string[];
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  typ: "refresh";
  sub: string; // userId
  sid: string; // sessionId
  jti: string; // refresh token JTI
  iss: string;
  aud: string[];
  iat: number;
  exp: number;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** HMAC-SHA256 for low-entropy 6-digit login codes (magic link, change email). */
export function hashLoginCode(code: string): string {
  return createHmac("sha256", Buffer.from(env.ENCRYPTION_KEY, "hex"))
    .update(`login-code:${code}`)
    .digest("hex");
}

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Returns 6-digit code (100000–999999) for magic link login. */
export function generateLoginCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export function generateJti(): string {
  return randomBytes(16).toString("base64url");
}

export function createAccessTokenPayload({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}): Omit<AccessTokenPayload, "iat" | "exp"> {
  return {
    typ: "access",
    sub: userId,
    sid: sessionId,
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
  };
}

export function createRefreshTokenPayload({
  userId,
  sessionId,
  jti,
}: {
  userId: string;
  sessionId: string;
  jti: string;
}): Omit<RefreshTokenPayload, "iat" | "exp"> {
  return {
    aud: env.JWT_AUDIENCE,
    iss: env.JWT_ISSUER,
    jti,
    sid: sessionId,
    sub: userId,
    typ: "refresh",
  };
}

interface AgentTokenPayload {
  agent: string;
  akid?: string;
  typ: "agent";
  sub: string;
  iss: string;
  aud: string;
}

export function createAgentTokenPayload({
  agentId,
  apiKeyId,
  userId,
}: {
  agentId: string;
  apiKeyId?: string;
  userId: string;
}): Omit<AgentTokenPayload, "iat" | "exp"> {
  return {
    agent: agentId,
    aud: env.AGENT_JWT_AUDIENCE,
    iss: env.JWT_ISSUER,
    sub: userId,
    typ: "agent",
    ...(apiKeyId ? { akid: apiKeyId } : {}),
  };
}

export type { AccessTokenPayload, AgentTokenPayload, RefreshTokenPayload };
