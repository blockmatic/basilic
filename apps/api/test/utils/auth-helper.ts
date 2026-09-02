import { randomUUID } from 'node:crypto'
import { privateKeyToAccount } from 'viem/accounts'
import { createSiweMessage } from 'viem/siwe'
import { getDb } from '../../src/db/index.js'
import { apiKeys, passkeyCredentials } from '../../src/db/schema/index.js'
import { generateApiKey } from '../../src/lib/api-keys/index.js'
import type { TestApp } from './fastify.js'

const sessionPool = new Map<string, string>()

/** Cached JWT by email - reduces magic-link requests when tests share users */
export async function getOrCreateSession(
  app: TestApp,
  email: string,
  options?: { clearBefore?: boolean },
): Promise<string> {
  if (options?.clearBefore) sessionPool.delete(email)
  const cached = sessionPool.get(email)
  if (cached) return cached
  const jwt = await getSessionToken(app, email, options)
  sessionPool.set(email, jwt)
  return jwt
}

export function clearSessionPool(): void {
  sessionPool.clear()
}

const anvilPrivateKeys = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b786127',
  '0x5de4111afa1a4b94908e83a8ec860c567f04b3aa191f021b7f36795a0579779b',
] as const

type AnvilAccountIndex = 0 | 1 | 2

function resolveAnvilPrivateKey(accountIndex: number): `0x${string}` {
  if (accountIndex < 0 || accountIndex >= anvilPrivateKeys.length)
    throw new Error(
      `Invalid accountIndex ${accountIndex}; supported indexes are 0–${anvilPrivateKeys.length - 1}`,
    )
  return anvilPrivateKeys[accountIndex as AnvilAccountIndex]
}

export async function getWeb3Session(
  app: TestApp,
  options?: { accountIndex?: AnvilAccountIndex },
): Promise<string> {
  const accountIndex = options?.accountIndex ?? 0
  const testPrivateKey = resolveAnvilPrivateKey(accountIndex)
  const testAccount = privateKeyToAccount(testPrivateKey)
  const nonceRes = await app.inject({
    method: 'GET',
    url: '/auth/web3/eip155/nonce',
    query: { address: testAccount.address },
  })
  if (nonceRes.statusCode !== 200) throw new Error(`nonce failed: ${nonceRes.body}`)
  const { nonce } = JSON.parse(nonceRes.body) as { nonce: string }
  const message = createSiweMessage({
    address: testAccount.address,
    chainId: 1,
    domain: 'localhost',
    nonce,
    uri: 'https://localhost',
    version: '1',
  })
  const signature = await testAccount.signMessage({ message })
  const verifyRes = await app.inject({
    method: 'POST',
    url: '/auth/web3/eip155/verify',
    payload: { message, signature },
  })
  if (verifyRes.statusCode !== 200) throw new Error(`web3 verify failed: ${verifyRes.body}`)
  const { token } = JSON.parse(verifyRes.body) as { token: string }
  return token
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
  const { token } = await getStoredMagicLink(email)
  return token
}

export async function getStoredMagicLink(
  email: string,
): Promise<{ token: string; verificationId: string }> {
  const stored = await getStoredVerification({ email, type: 'magic_link' })
  if (!stored) throw new Error('No magic link token in verification table')
  return stored
}

async function getStoredVerification({
  email,
  type,
  userId,
}: {
  email: string
  type: 'magic_link' | 'link_email'
  userId?: string
}): Promise<{ token: string; verificationId: string } | null> {
  const db = await getDb()
  const { verification } = await import('../../src/db/schema/index.js')
  const { and, desc, eq, isNotNull } = await import('drizzle-orm')

  const identifier = type === 'link_email' ? `${userId}:${email}` : email

  const [row] = await db
    .select({ tokenPlain: verification.tokenPlain, id: verification.id })
    .from(verification)
    .where(
      and(
        eq(verification.type, type),
        eq(verification.identifier, identifier),
        isNotNull(verification.tokenPlain),
      ),
    )
    .orderBy(desc(verification.createdAt))
    .limit(1)

  if (!row?.tokenPlain) return null
  return { token: row.tokenPlain, verificationId: row.id }
}

export async function getLinkEmailToken(
  app: TestApp,
  jwt: string,
  email: string,
  callbackUrl = 'https://example.com/link-callback',
): Promise<string> {
  const requestRes = await app.inject({
    method: 'POST',
    url: '/account/link/email/request',
    headers: { Authorization: `Bearer ${jwt}` },
    payload: { email, callbackUrl },
  })
  if (requestRes.statusCode !== 200)
    throw new Error(
      `account/link/email/request failed: ${requestRes.statusCode} ${requestRes.body}`,
    )

  return readLinkEmailToken(app, jwt, email)
}

export async function readLinkEmailToken(
  app: TestApp,
  jwt: string,
  email: string,
): Promise<string> {
  const userRes = await app.inject({
    method: 'GET',
    url: '/auth/session/user',
    headers: { Authorization: `Bearer ${jwt}` },
  })
  if (userRes.statusCode !== 200) throw new Error(`auth/session/user failed: ${userRes.body}`)
  const userId = (JSON.parse(userRes.body) as { user: { id: string } }).user.id

  const stored = await getStoredVerification({ email, type: 'link_email', userId })
  if (!stored) throw new Error('No link email token in verification table')
  return stored.token
}

export async function getSessionToken(
  app: TestApp,
  email: string,
  options?: { clearBefore?: boolean },
): Promise<string> {
  if (options?.clearBefore) {
    const db = await getDb()
    const { verification } = await import('../../src/db/schema/index.js')
    const { like } = await import('drizzle-orm')
    await db.delete(verification).where(like(verification.identifier, `%${email}`))
  }
  const requestRes = await app.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })
  if (requestRes.statusCode < 200 || requestRes.statusCode >= 300)
    throw new Error(
      `auth/magiclink/request failed: url=/auth/magiclink/request status=${requestRes.statusCode} body=${requestRes.body}`,
    )

  const { token } = await getStoredMagicLink(email)
  const verifyRes = await app.inject({
    method: 'POST',
    url: '/auth/magiclink/verify',
    payload: { email, token },
  })
  if (verifyRes.statusCode < 200 || verifyRes.statusCode >= 300)
    throw new Error(
      `auth/magiclink/verify failed: url=/auth/magiclink/verify status=${verifyRes.statusCode} body=${verifyRes.body}`,
    )

  const { token: jwt } = JSON.parse(verifyRes.body) as { token: string }
  return jwt
}

export async function getApiKeyToken(app: TestApp, email: string): Promise<string> {
  const jwt = await getOrCreateSession(app, email)
  const res = await app.inject({
    method: 'POST',
    url: '/account/apikeys',
    headers: { Authorization: `Bearer ${jwt}` },
    payload: { name: 'Test Key' },
  })
  if (res.statusCode < 200 || res.statusCode >= 300)
    throw new Error(`create apikey failed: ${res.statusCode} ${res.body}`)

  const { key } = JSON.parse(res.body) as { key: string }
  return key
}

export async function createAuthenticatedUser(
  app: TestApp,
  overrides?: { email?: string },
): Promise<{ token: string; email: string }> {
  const email = overrides?.email ?? 'test@test.ai'
  const token = await getOrCreateSession(app, email)
  return { token, email }
}

export async function insertTestPasskey(
  app: TestApp,
  jwt: string,
  name = 'To Delete',
): Promise<string> {
  const userRes = await app.inject({
    method: 'GET',
    url: '/auth/session/user',
    headers: { Authorization: `Bearer ${jwt}` },
  })
  if (userRes.statusCode !== 200)
    throw new Error(`auth/session/user failed: ${userRes.statusCode} ${userRes.body}`)
  const body = JSON.parse(userRes.body) as { user?: { id: string } }
  const userId = body.user?.id
  if (!userId) throw new Error('No user id in profile response')
  const db = await getDb()
  const passkeyId = randomUUID()
  await db.insert(passkeyCredentials).values({
    id: passkeyId,
    userId,
    credentialId: `cred-${randomUUID()}`,
    publicKey: 'dGVzdC1wdWJsaWMta2V5',
    counter: 0,
    name,
  })
  return passkeyId
}
