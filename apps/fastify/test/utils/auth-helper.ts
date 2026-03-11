import { randomUUID } from 'node:crypto'
import { getDb } from '../../src/db/index.js'
import { apiKeys, passkeyCredentials } from '../../src/db/schema/index.js'
import { generateApiKey } from '../../src/lib/api-keys.js'
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
  if (requestRes.statusCode < 200 || requestRes.statusCode >= 300)
    throw new Error(
      `auth/magiclink/request failed: url=/auth/magiclink/request status=${requestRes.statusCode} body=${requestRes.body}`,
    )

  const lastForEmail = app.fakeEmail
    ?.all()
    .filter(e => e.to === email)
    .at(-1)
  const token = lastForEmail
    ? app.fakeEmail?.extractToken(lastForEmail)
    : app.fakeEmail?.extractToken()
  if (!token) throw new Error('No token in fake email')
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
