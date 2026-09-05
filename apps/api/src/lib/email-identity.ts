import { sql } from 'drizzle-orm'
import type { getDb } from '../db/index.js'
import { users } from '../db/schema/index.js'
import { normalizeEmail } from './email.js'

type Db = Awaited<ReturnType<typeof getDb>>

export class EmailIdentityCollisionError extends Error {
  constructor() {
    super('Multiple user rows share the same normalized email')
    this.name = 'EmailIdentityCollisionError'
  }
}

export async function findUserByNormalizedEmail({ db, email }: { db: Db; email: string }) {
  const normalized = normalizeEmail(email)
  const matches = await db.select().from(users).where(sql`lower(${users.email}) = ${normalized}`)
  if (matches.length > 1) throw new EmailIdentityCollisionError()
  return { user: matches[0], normalized }
}
