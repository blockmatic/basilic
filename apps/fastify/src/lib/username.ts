import { createHash, randomBytes } from 'node:crypto'
import { faker } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import type { getDb } from '../db/index.js'
import { users } from '../db/schema/index.js'
import { env } from '../lib/env.js'

type Db = Awaited<ReturnType<typeof getDb>>
type Tx = Parameters<Parameters<NonNullable<Db>['transaction']>[0]>[0]

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 48)
}

async function isUsernameTaken(client: Db | Tx, username: string): Promise<boolean> {
  const [row] = await client
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
  return !!row
}

function randomSuffix(maxLen: number): string {
  const hex = randomBytes(4).toString('hex')
  return maxLen > 0 ? hex.slice(0, maxLen) : hex.slice(0, 4)
}

/** Deterministic username for @test.ai when ALLOW_TEST - avoids faker collisions under load */
export function generateTestUsername(email: string): string {
  const hash = createHash('sha256').update(email).digest('hex').slice(0, 12)
  return `user_${hash}`
}

export async function generateFunnyUsername(client: Db | Tx): Promise<string> {
  const base = slugify(`${faker.word.adjective()}_${faker.animal.type()}`)
  if (!base) return `user_${randomBytes(4).toString('hex')}`
  if (!(await isUsernameTaken(client, base))) return base

  const suf = randomSuffix(8)
  const candidate =
    base.length + suf.length + 1 <= 48 ? `${base}_${suf}` : `${base.slice(0, 39)}_${suf}`
  if (!(await isUsernameTaken(client, candidate))) return candidate

  for (let i = 0; i < 10; i++) {
    const maxLen = Math.max(0, 48 - candidate.length)
    const s = randomSuffix(maxLen)
    const next =
      candidate.length + s.length > 48 ? `${candidate.slice(0, 44)}${s}` : `${candidate}${s}`
    const trimmed = next.slice(0, 48)
    if (!(await isUsernameTaken(client, trimmed))) return trimmed
  }
  for (let i = 0; i < 100; i++) {
    const fallback = `${candidate.slice(0, 41)}_${randomBytes(3).toString('hex')}`
    if (!(await isUsernameTaken(client, fallback))) return fallback
  }
  throw new Error('generateFunnyUsername: could not find available username after retries')
}

/** Username for magic link user creation - deterministic for @test.ai in test mode */
export async function generateUsernameForMagicLink(
  client: Db | Tx,
  email: string,
): Promise<string> {
  if (env.ALLOW_TEST === true && typeof email === 'string' && email.endsWith('@test.ai'))
    return generateTestUsername(email)
  return generateFunnyUsername(client)
}
