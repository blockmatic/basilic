import { timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { getDb } from '../../db/index.js'
import { apiKeys, users } from '../../db/schema/index.js'
import { hashToken } from '../jwt.js'
import { parseApiKey } from './keys.js'

type Db = Awaited<ReturnType<typeof getDb>>

const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)

export type ApiKeySession = {
  user: { id: string; email: string | null; name: string | null; username: string | null }
  session: { id: string; userId: string; expiresAt: Date }
}

export async function authenticateWithApiKey(token: string, db: Db): Promise<ApiKeySession | null> {
  const parsed = parseApiKey(token)
  if (!parsed) return null

  const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.prefix, parsed.prefix))

  if (!apiKey || (apiKey.expiresAt && apiKey.expiresAt < new Date())) return null

  const computedHash = hashToken(parsed.secret)
  const computedBuf = Buffer.from(computedHash, 'hex')
  const storedBuf = Buffer.from(apiKey.hash, 'hex')
  if (computedBuf.length !== storedBuf.length || !timingSafeEqual(computedBuf, storedBuf))
    return null

  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, apiKey.id))

  const [user] = await db.select().from(users).where(eq(users.id, apiKey.userId))
  if (!user) return null

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      name: user.name ?? null,
      username: user.username ?? null,
    },
    session: {
      id: apiKey.id,
      userId: apiKey.userId,
      expiresAt: apiKey.expiresAt ?? farFuture,
    },
  }
}
