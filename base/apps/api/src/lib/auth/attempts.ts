import { randomUUID } from "node:crypto";

import type { getDb } from "@repo/db";
import { authAttempts } from "@repo/db/schema";
import { sql } from "drizzle-orm";

type AuthAttemptType = "magic_link" | "change_email";

export async function recordAuthFailedAttempt({
  db,
  ip,
  type,
  maxAttempts,
  lockMinutes,
}: {
  db: Awaited<ReturnType<typeof getDb>>;
  ip: string;
  type: AuthAttemptType;
  maxAttempts: number;
  lockMinutes: number;
}): Promise<void> {
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + lockMinutes * 60 * 1000);
  await db
    .insert(authAttempts)
    .values({
      failedAttempts: 1,
      firstFailureAt: now,
      id: randomUUID(),
      key: ip,
      lockedUntil: maxAttempts <= 1 ? lockedUntil : null,
      type,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        failedAttempts: sql`${authAttempts.failedAttempts} + 1`,
        firstFailureAt: sql`COALESCE(${authAttempts.firstFailureAt}, ${now})`,
        lockedUntil: sql`CASE WHEN ${authAttempts.failedAttempts} + 1 >= ${maxAttempts} AND (${authAttempts.lockedUntil} IS NULL OR ${authAttempts.lockedUntil} <= ${now}) THEN ${lockedUntil} ELSE ${authAttempts.lockedUntil} END`,
        updatedAt: now,
      },
      target: [authAttempts.key, authAttempts.type],
    });
}
