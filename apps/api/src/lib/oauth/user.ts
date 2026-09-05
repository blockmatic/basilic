import { randomUUID } from 'node:crypto'
import type { getDb } from '../../db/index.js'
import { users } from '../../db/schema/index.js'
import { isUniqueViolation } from '../db-errors.js'
import { findUserByNormalizedEmail } from '../email-identity.js'
import { generateUsernameForMagicLink } from '../username.js'

type Db = Awaited<ReturnType<typeof getDb>>

const maxRetries = 5

/** Find or create user by email with retry on username collision. For OAuth providers that use email. */
export async function findOrCreateUserByEmail(
  db: Db,
  input: { email: string; name: string; emailVerified: boolean },
): Promise<typeof users.$inferSelect | null> {
  const { user: existing, normalized } = await findUserByNormalizedEmail({ db, email: input.email })
  if (existing) return existing

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const username = await generateUsernameForMagicLink(db, normalized)
    try {
      await db
        .insert(users)
        .values({
          id: randomUUID(),
          email: normalized,
          emailVerified: input.emailVerified,
          name: input.name,
          username,
        })
        .onConflictDoNothing({ target: users.email })
      const { user } = await findUserByNormalizedEmail({ db, email: normalized })
      return user ?? null
    } catch (err) {
      if (isUniqueViolation(err) && attempt < maxRetries - 1) continue
      throw err
    }
  }
  return null
}
