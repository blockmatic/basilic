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

type Db = Awaited<ReturnType<typeof getDb>>
type Tx = Parameters<Parameters<NonNullable<Db>['transaction']>[0]>[0]

export async function generateFunnyUsername(client: Db | Tx): Promise<string> {
  const base = slugify(`${faker.word.adjective()}_${faker.animal.type()}`)
  if (!base) return `user_${randomBytes(4).toString('hex')}`

  const [existing] = await client
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, base))
  if (!existing) return base

  const suffix = randomBytes(4).toString('hex')
  const candidate =
    base.length + suffix.length + 1 <= 48 ? `${base}_${suffix}` : `${base.slice(0, 39)}_${suffix}`

  const [existing2] = await client
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, candidate))
  if (!existing2) return candidate

  for (let i = 0; i < 10; i++) {
    const maxSuffixLen = Math.max(0, 48 - candidate.length)
    const suffix =
      maxSuffixLen > 0
        ? randomBytes(2).toString('hex').slice(0, maxSuffixLen)
        : randomBytes(2).toString('hex').slice(0, 4)
    const base = candidate.length + suffix.length > 48 ? candidate.slice(0, 44) : candidate
    const newCandidate = `${base}${suffix}`.slice(0, 48)
    const [existing3] = await client
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, newCandidate))
    if (!existing3) return newCandidate
  }
  return `${candidate.slice(0, 41)}_${randomBytes(3).toString('hex')}`
}
