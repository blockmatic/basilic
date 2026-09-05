import { sql } from 'drizzle-orm'
import type { getDb } from '../db/index.js'
import { users } from '../db/schema/index.js'
import { normalizeEmail } from './email.js'

type Db = Awaited<ReturnType<typeof getDb>>
type UserRow = typeof users.$inferSelect

export type FindUserByNormalizedEmailResult =
  | { status: 'ok'; user: UserRow | undefined; normalized: string }
  | { status: 'collision'; normalized: string }

export async function findUserByNormalizedEmail({
  db,
  email,
}: {
  db: Db
  email: string
}): Promise<FindUserByNormalizedEmailResult> {
  const normalized = normalizeEmail(email)
  const matches = await db.select().from(users).where(sql`lower(${users.email}) = ${normalized}`)
  if (matches.length > 1) return { status: 'collision', normalized }
  return { status: 'ok', user: matches[0], normalized }
}
