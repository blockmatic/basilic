import { randomUUID } from "node:crypto";

import fastifyJwt from "@fastify/jwt";
import { getDb } from "@repo/db";
import { apiKeys, passkeyCredentials, users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";

import { generateApiKey } from "../../src/lib/api-keys/index.js";
import { env } from "../../src/lib/env.js";
import { createSessionAndIssueTokens } from "../../src/lib/session/issue.js";
import type { TestApp } from "./fastify.js";

let tokenSigner: FastifyInstance | undefined;

async function jwtSigner(): Promise<FastifyInstance["jwt"]> {
  if (!tokenSigner) {
    tokenSigner = Fastify({ logger: false });
    await tokenSigner.register(fastifyJwt, {
      secret: env.JWT_SECRET,
      sign: { algorithm: "HS256" },
    });
    await tokenSigner.ready();
  }
  return tokenSigner.jwt;
}

const sessionPool = new Map<string, string>();

/** Cached JWT by email - reduces magic-link requests when tests share users */
export async function getOrCreateSession(
  app: TestApp,
  email: string,
  options?: { clearBefore?: boolean }
): Promise<string> {
  if (options?.clearBefore) {
    sessionPool.delete(email);
  }
  const cached = sessionPool.get(email);
  if (cached) {
    return cached;
  }
  const jwt = await getSessionToken(app, email, options);
  sessionPool.set(email, jwt);
  return jwt;
}

export function clearSessionPool(): void {
  sessionPool.clear();
}

export async function createApiKey(
  _app: TestApp,
  userId: string,
  name = "Test Key"
): Promise<string> {
  const { key, prefix, hash } = generateApiKey();
  const db = await getDb();
  await db.insert(apiKeys).values({
    hash,
    id: randomUUID(),
    name,
    prefix,
    userId,
  });
  return key;
}

export async function getMagicLinkTokenRaw(
  app: TestApp,
  email = "test@test.ai"
): Promise<string> {
  await app.inject({
    method: "POST",
    payload: { callbackUrl: "https://example.com/callback", email },
    url: "/auth/magiclink/request",
  });
  const { token } = await getStoredMagicLink(email);
  return token;
}

export async function getStoredMagicLink(
  email: string
): Promise<{ token: string; verificationId: string }> {
  const stored = await getStoredVerification({ email, type: "magic_link" });
  if (!stored) {
    throw new Error("No magic link token in verification table");
  }
  return stored;
}

async function getStoredVerification({
  email,
  type,
  userId,
}: {
  email: string;
  type: "magic_link" | "link_email";
  userId?: string;
}): Promise<{ token: string; verificationId: string } | null> {
  const db = await getDb();
  const { verification } = await import("@repo/db/schema");
  const { and, desc, eq, isNotNull } = await import("drizzle-orm");

  const identifier = type === "link_email" ? `${userId}:${email}` : email;

  const [row] = await db
    .select({ id: verification.id, tokenPlain: verification.tokenPlain })
    .from(verification)
    .where(
      and(
        eq(verification.type, type),
        eq(verification.identifier, identifier),
        isNotNull(verification.tokenPlain)
      )
    )
    .orderBy(desc(verification.createdAt))
    .limit(1);

  if (!row?.tokenPlain) {
    return null;
  }
  return { token: row.tokenPlain, verificationId: row.id };
}

export async function getLinkEmailToken(
  app: TestApp,
  jwt: string,
  email: string,
  callbackUrl = "https://example.com/link-callback"
): Promise<string> {
  const requestRes = await app.inject({
    headers: { Authorization: `Bearer ${jwt}` },
    method: "POST",
    payload: { callbackUrl, email },
    url: "/account/link/email/request",
  });
  if (requestRes.statusCode !== 200) {
    throw new Error(
      `account/link/email/request failed: ${requestRes.statusCode} ${requestRes.body}`
    );
  }

  return readLinkEmailToken(app, jwt, email);
}

export async function readLinkEmailToken(
  app: TestApp,
  jwt: string,
  email: string
): Promise<string> {
  const userRes = await app.inject({
    headers: { Authorization: `Bearer ${jwt}` },
    method: "GET",
    url: "/auth/session/user",
  });
  if (userRes.statusCode !== 200) {
    throw new Error(`auth/session/user failed: ${userRes.body}`);
  }
  const userId = (JSON.parse(userRes.body) as { user: { id: string } }).user.id;

  const stored = await getStoredVerification({
    email,
    type: "link_email",
    userId,
  });
  if (!stored) {
    throw new Error("No link email token in verification table");
  }
  return stored.token;
}

export async function getSessionToken(
  app: TestApp,
  email: string,
  options?: { clearBefore?: boolean }
): Promise<string> {
  if (options?.clearBefore) {
    const db = await getDb();
    const { verification } = await import("@repo/db/schema");
    const { like } = await import("drizzle-orm");
    await db
      .delete(verification)
      .where(like(verification.identifier, `%${email}`));
  }
  const requestRes = await app.inject({
    method: "POST",
    payload: { callbackUrl: "https://example.com/callback", email },
    url: "/auth/magiclink/request",
  });
  if (requestRes.statusCode < 200 || requestRes.statusCode >= 300) {
    throw new Error(
      `auth/magiclink/request failed: url=/auth/magiclink/request status=${requestRes.statusCode} body=${requestRes.body}`
    );
  }

  const { token } = await getStoredMagicLink(email);
  const verifyRes = await app.inject({
    method: "POST",
    payload: { email, token },
    url: "/auth/magiclink/verify",
  });
  if (verifyRes.statusCode < 200 || verifyRes.statusCode >= 300) {
    throw new Error(
      `auth/magiclink/verify failed: url=/auth/magiclink/verify status=${verifyRes.statusCode} body=${verifyRes.body}`
    );
  }

  const { token: jwt } = JSON.parse(verifyRes.body) as { token: string };
  return jwt;
}

export async function getApiKeyToken(
  app: TestApp,
  email: string
): Promise<string> {
  const jwt = await getOrCreateSession(app, email);
  const res = await app.inject({
    headers: { Authorization: `Bearer ${jwt}` },
    method: "POST",
    payload: { name: "Test Key" },
    url: "/account/apikeys",
  });
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`create apikey failed: ${res.statusCode} ${res.body}`);
  }

  const { key } = JSON.parse(res.body) as { key: string };
  return key;
}

export async function getSessionWithoutEmail(app: TestApp): Promise<string> {
  const db = await getDb();
  const userId = randomUUID();
  await db.insert(users).values({
    email: null,
    emailVerified: false,
    id: userId,
    name: "No inbox",
  });
  const jwt = await jwtSigner();
  const { accessToken } = await createSessionAndIssueTokens({
    db,
    fastify: new Proxy(app, {
      get(target, prop, receiver) {
        if (prop === "jwt") {
          return jwt;
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as TestApp,
    request: {
      headers: {},
      ip: "127.0.0.1",
      log: app.log,
    } as Parameters<typeof createSessionAndIssueTokens>[0]["request"],
    signInMethod: "passkey",
    user: { email: null, id: userId, name: "No inbox" },
  });
  return accessToken;
}

export async function createAuthenticatedUser(
  app: TestApp,
  overrides?: { email?: string }
): Promise<{ token: string; email: string }> {
  const email = overrides?.email ?? "test@test.ai";
  const token = await getOrCreateSession(app, email);
  return { email, token };
}

export async function insertTestPasskey(
  app: TestApp,
  jwt: string,
  name = "To Delete"
): Promise<string> {
  const userRes = await app.inject({
    headers: { Authorization: `Bearer ${jwt}` },
    method: "GET",
    url: "/auth/session/user",
  });
  if (userRes.statusCode !== 200) {
    throw new Error(
      `auth/session/user failed: ${userRes.statusCode} ${userRes.body}`
    );
  }
  const body = JSON.parse(userRes.body) as { user?: { id: string } };
  const userId = body.user?.id;
  if (!userId) {
    throw new Error("No user id in profile response");
  }
  const db = await getDb();
  const passkeyId = randomUUID();
  await db.insert(passkeyCredentials).values({
    counter: 0,
    credentialId: `cred-${randomUUID()}`,
    id: passkeyId,
    name,
    publicKey: "dGVzdC1wdWJsaWMta2V5",
    userId,
  });
  return passkeyId;
}
