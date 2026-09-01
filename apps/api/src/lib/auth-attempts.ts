import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import type { getDb } from '../db/index.js'
import { authAttempts } from '../db/schema/index.js'

type AuthAttemptType = 'magic_link' | 'change_email'

export async function recordAuthFailedAttempt({
  db,
  ip,
  type,
  maxAttempts,
  lockMinutes,
}: {
  db: Awaited<ReturnType<typeof getDb>>
  ip: string
  type: AuthAttemptType
  maxAttempts: number
  lockMinutes: number
}): Promise<void> {
  const now = new Date()
  const lockedUntil = new Date(now.getTime() + lockMinutes * 60 * 1000)
  await db
    .insert(authAttempts)
    .values({
      id: randomUUID(),
      key: ip,
      type,
      failedAttempts: 1,
      firstFailureAt: now,
      lockedUntil: maxAttempts <= 1 ? lockedUntil : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [authAttempts.key, authAttempts.type],
      set: {
        failedAttempts: sql`${authAttempts.failedAttempts} + 1`,
        firstFailureAt: sql`COALESCE(${authAttempts.firstFailureAt}, ${now})`,
        lockedUntil: sql`CASE WHEN ${authAttempts.failedAttempts} + 1 >= ${maxAttempts} AND (${authAttempts.lockedUntil} IS NULL OR ${authAttempts.lockedUntil} <= ${now}) THEN ${lockedUntil} ELSE ${authAttempts.lockedUntil} END`,
        updatedAt: now,
      },
    })
}
