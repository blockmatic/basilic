import { randomBytes } from 'node:crypto'
import { faker } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema/index.js'

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 48)
}

import type { getDb } from '../db/index.js'

export async function generateFunnyUsername(
  db: Awaited<ReturnType<typeof getDb>>,
): Promise<string> {
  const base = slugify(`${faker.word.adjective()}_${faker.animal.type()}`)
  if (!base) return `user_${randomBytes(4).toString('hex')}`

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, base))
  if (!existing) return base

  const suffix = randomBytes(4).toString('hex')
  const candidate =
    base.length + suffix.length + 1 <= 48 ? `${base}_${suffix}` : `${base.slice(0, 39)}_${suffix}`

  const [existing2] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, candidate))
  if (!existing2) return candidate

  return `${candidate}${randomBytes(2).toString('hex')}`
}
