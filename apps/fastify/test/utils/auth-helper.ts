import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../../src/db/index.js'
import { apiKeys, users, walletIdentities } from '../../src/db/schema/index.js'
import { generateApiKey } from '../../src/lib/api-keys.js'
import type { TestApp } from './fastify.js'

/** Seed a verified user with linked wallet so Web3 verify succeeds (link-only flow). Idempotent - skips if wallet exists. */
export async function seedVerifiedUserWithWallet({
  chain,
  address,
}: {
  chain: 'eip155' | 'solana'
  address: string
}): Promise<{ userId: string }> {
  const db = await getDb()
  const [existing] = await db
    .select({ userId: walletIdentities.userId })
    .from(walletIdentities)
    .where(and(eq(walletIdentities.chain, chain), eq(walletIdentities.address, address)))
  if (existing) return { userId: existing.userId }

  const userId = randomUUID()
  await db.insert(users).values({
    id: userId,
    email: `web3-test-${userId}@test.local`,
    emailVerified: true,
  })
  await db.insert(walletIdentities).values({
    id: randomUUID(),
    userId,
    chain,
    address,
  })
  return { userId }
}

export async function createApiKey(
  _app: TestApp,
  userId: string,
  name = 'Test Key',
): Promise<string> {
  const { key, prefix, hash } = generateApiKey()
  const db = await getDb()
  await db.insert(apiKeys).values({
    id: randomUUID(),
    userId,
    name,
    prefix,
    hash,
  })
  return key
}

export async function getMagicLinkTokenRaw(app: TestApp, email = 'test@test.ai'): Promise<string> {
  await app.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })
  const token = app.fakeEmail?.extractToken()
  if (!token) throw new Error('No token in fake email')
  return token
}

export async function getSessionToken(
  app: TestApp,
  email: string,
  options?: { clearBefore?: boolean },
): Promise<string> {
  if (options?.clearBefore) app.fakeEmail?.clear()
  const requestRes = await app.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })
  if (requestRes.statusCode < 200 || requestRes.statusCode >= 300) {
    throw new Error(
      `auth/magiclink/request failed: url=/auth/magiclink/request status=${requestRes.statusCode} body=${requestRes.body}`,
    )
  }
  const token = app.fakeEmail?.extractToken()
  if (!token) throw new Error('No token in fake email')
  const verifyRes = await app.inject({
    method: 'POST',
    url: '/auth/magiclink/verify',
    payload: { token },
  })
  if (verifyRes.statusCode < 200 || verifyRes.statusCode >= 300) {
    throw new Error(
      `auth/magiclink/verify failed: url=/auth/magiclink/verify status=${verifyRes.statusCode} body=${verifyRes.body}`,
    )
  }
  const { token: jwt } = JSON.parse(verifyRes.body) as { token: string }
  return jwt
}

export async function getApiKeyToken(app: TestApp, email: string): Promise<string> {
  const jwt = await getSessionToken(app, email)
  const res = await app.inject({
    method: 'POST',
    url: '/account/apikeys',
    headers: { Authorization: `Bearer ${jwt}` },
    payload: { name: 'Test Key' },
  })
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`create apikey failed: ${res.statusCode} ${res.body}`)
  }
  const { key } = JSON.parse(res.body) as { key: string }
  return key
}

export async function createAuthenticatedUser(
  app: TestApp,
  overrides?: { email?: string },
): Promise<{ token: string; email: string }> {
  const email = overrides?.email ?? 'test@example.com'
  const token = await getSessionToken(app, email)
  return { token, email }
}
