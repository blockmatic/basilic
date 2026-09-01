import { randomUUID } from 'node:crypto'
import { and, eq, sql } from 'drizzle-orm'
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
}) {
  const now = new Date()
  await db
    .insert(authAttempts)
    .values({
      id: randomUUID(),
      key: ip,
      type,
      failedAttempts: 1,
      firstFailureAt: now,
      lockedUntil: null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [authAttempts.key, authAttempts.type],
      set: {
        failedAttempts: sql`${authAttempts.failedAttempts} + 1`,
        firstFailureAt: sql`COALESCE(${authAttempts.firstFailureAt}, ${now})`,
        updatedAt: now,
      },
    })

  const [row] = await db
    .select()
    .from(authAttempts)
    .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, type)))

  if (row && row.failedAttempts >= maxAttempts && row.lockedUntil == null) {
    const lockedUntil = new Date(now.getTime() + lockMinutes * 60 * 1000)
    await db
      .update(authAttempts)
      .set({ lockedUntil, updatedAt: now })
      .where(and(eq(authAttempts.key, ip), eq(authAttempts.type, type)))
  }
}
