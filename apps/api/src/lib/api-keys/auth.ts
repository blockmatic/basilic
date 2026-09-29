import { timingSafeEqual } from "node:crypto";

import type { getDb } from "@repo/db";
import { apiKeys, users } from "@repo/db/schema";
import { eq } from "drizzle-orm";

import { hashToken } from "../jwt.js";
import { parseApiKey } from "./keys.js";

type Db = Awaited<ReturnType<typeof getDb>>;

const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);

export interface ApiKeySession {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    username: string | null;
  };
  session: { id: string; userId: string; expiresAt: Date };
}

export async function authenticateWithApiKey(
  token: string,
  db: Db
): Promise<ApiKeySession | null> {
  const parsed = parseApiKey(token);
  if (!parsed) {
    return null;
  }

  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.prefix, parsed.prefix));

  if (!apiKey || (apiKey.expiresAt && apiKey.expiresAt < new Date())) {
    return null;
  }

  const computedHash = hashToken(parsed.secret);
  const computedBuf = Buffer.from(computedHash, "hex");
  const storedBuf = Buffer.from(apiKey.hash, "hex");
  if (
    computedBuf.length !== storedBuf.length ||
    !timingSafeEqual(computedBuf, storedBuf)
  ) {
    return null;
  }

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id));

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, apiKey.userId));
  if (!user) {
    return null;
  }

  return {
    session: {
      expiresAt: apiKey.expiresAt ?? farFuture,
      id: apiKey.id,
      userId: apiKey.userId,
    },
    user: {
      email: user.email ?? null,
      id: user.id,
      name: user.name ?? null,
      username: user.username ?? null,
    },
  };
}
