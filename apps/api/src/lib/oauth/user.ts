import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { getDb } from '../../db/index.js'
import { users } from '../../db/schema/index.js'
import { isUniqueViolation } from '../db-errors.js'
import { generateUsernameForMagicLink } from '../username.js'

type Db = Awaited<ReturnType<typeof getDb>>

const maxRetries = 5

/** Find or create user by email with retry on username collision. For OAuth providers that use email. */
export async function findOrCreateUserByEmail(
  db: Db,
  input: { email: string; name: string; emailVerified: boolean },
): Promise<typeof users.$inferSelect | null> {
  const [existing] = await db.select().from(users).where(eq(users.email, input.email))
  if (existing) return existing

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const username = await generateUsernameForMagicLink(db, input.email)
    try {
      await db
        .insert(users)
        .values({
          id: randomUUID(),
          email: input.email,
          emailVerified: input.emailVerified,
          name: input.name,
          username,
        })
        .onConflictDoNothing({ target: users.email })
      const [user] = await db.select().from(users).where(eq(users.email, input.email))
      return user ?? null
    } catch (err) {
      if (isUniqueViolation(err) && attempt < maxRetries - 1) continue
      throw err
    }
  }
  return null
}
