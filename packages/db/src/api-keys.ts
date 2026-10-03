import { and, eq } from "drizzle-orm";

import { getDb } from "./client.js";
import { apiKeys } from "./schema/index.js";

/** True while the key exists, belongs to the user, and has not expired. Revocation deletes the row. */
export async function isApiKeyActive({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<boolean> {
  const db = await getDb();
  const [key] = await db
    .select({ expiresAt: apiKeys.expiresAt })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
    .limit(1);
  return Boolean(key) && !(key?.expiresAt && key.expiresAt < new Date());
}
