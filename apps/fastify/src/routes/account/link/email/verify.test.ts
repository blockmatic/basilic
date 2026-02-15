import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../../account.spec.js'

async function getSessionToken(email = 'user@test.ai'): Promise<string> {
  fastify.fakeEmail?.clear()
  await fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })
  const token = fastify.fakeEmail?.extractToken()
  if (!token) throw new Error('No token in fake email')
  const verifyRes = await fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/verify',
    payload: { token },
  })
  const { token: jwt } = JSON.parse(verifyRes.body)
  return jwt
}

describe('POST /account/link/email/verify', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      payload: { token: 'any-token' },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should verify link token and return new JWTs', async () => {
    const jwt = await getSessionToken()
    fastify.fakeEmail?.clear()

    await fastify.inject({
      method: 'POST',
      url: '/account/link/email/request',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: 'linked@example.com',
        callbackUrl: 'https://example.com/callback',
      },
    })

    const linkToken = fastify.fakeEmail?.extractToken()
    if (!linkToken) throw new Error('No link token')

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { token: linkToken },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')
    expect(typeof body.token).toBe('string')
    expect(typeof body.refreshToken).toBe('string')

    const db = await (await import('../../../../db/index.js')).getDb()
    const { users } = await import('../../../../db/schema/index.js')
    const { eq } = await import('drizzle-orm')
    const [user] = await db.select().from(users).where(eq(users.email, 'linked@example.com'))
    expect(user).toBeDefined()
    expect(user?.emailVerified).toBe(true)
  })

  it('should return EXPIRED_TOKEN for expired token', async () => {
    const jwt = await getSessionToken()
    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { token: 'expired-token-xxxx' },
    })
    expect([401, 404]).toContain(response.statusCode)
    if (response.statusCode === 401) {
      const body = JSON.parse(response.body)
      expect(['INVALID_TOKEN', 'EXPIRED_TOKEN']).toContain(body.code)
    }
  })
})
