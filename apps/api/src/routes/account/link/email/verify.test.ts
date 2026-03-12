import { describe, expect, it } from 'vitest'
import { getApiKeyToken, getOrCreateSession } from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

describe('POST /account/link/email/verify', () => {
  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      payload: { token: 'any-token' },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should verify link token and return new JWTs', async () => {
    const jwt = await getOrCreateSession(fastify, 'user@test.ai', { clearBefore: true })
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
    const jwt = await getOrCreateSession(fastify, 'expired-token@test.ai', { clearBefore: true })
    const db = await (await import('../../../../db/index.js')).getDb()
    const { verification } = await import('../../../../db/schema/index.js')
    const { hashToken } = await import('../../../../lib/jwt.js')
    const { randomUUID } = await import('node:crypto')

    const expiredToken = `expired-test-token-${randomUUID().slice(0, 8)}`
    const tokenHash = hashToken(expiredToken)
    const userId = JSON.parse(Buffer.from(jwt.split('.')[1] ?? '', 'base64url').toString())
      .sub as string

    await db.insert(verification).values({
      id: randomUUID(),
      type: 'link_email',
      identifier: `${userId}:expired@test.ai`,
      value: tokenHash,
      expiresAt: new Date(Date.now() - 60 * 1000),
    })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { token: expiredToken },
    })
    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('EXPIRED_TOKEN')
  })

  it('should verify link when authenticated via API key', async () => {
    const jwt = await getOrCreateSession(fastify, 'verify-apikey@test.ai', {
      clearBefore: true,
    })
    fastify.fakeEmail?.clear()

    await fastify.inject({
      method: 'POST',
      url: '/account/link/email/request',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: {
        email: 'linked-apikey@example.com',
        callbackUrl: 'https://example.com/callback',
      },
    })

    const linkToken = fastify.fakeEmail?.extractToken()
    if (!linkToken) throw new Error('No link token')

    const apiKey = await getApiKeyToken(fastify, 'verify-apikey@test.ai')

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      headers: { Authorization: `Bearer ${apiKey}` },
      payload: { token: linkToken },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')
  })
})
