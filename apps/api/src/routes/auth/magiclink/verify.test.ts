import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '../../../../src/db/index.js'
import { authAttempts, users, verification } from '../../../../src/db/schema/index.js'
import { hashToken } from '../../../../src/lib/jwt.js'
import { getStoredMagicLink } from '../../../../test/utils/auth-helper.js'
import { fastify } from './magiclink.spec.js'

describe('POST /auth/magiclink/verify', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return INVALID_INPUT when both email and verificationId are provided', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: {
        token: '123456',
        email: 'test@test.ai',
        verificationId: '00000000-0000-0000-0000-000000000001',
      },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('INVALID_INPUT')
  })

  it('should return INVALID_INPUT when neither email nor verificationId is provided', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token: '123456' },
    })
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).code).toBe('INVALID_INPUT')
  })

  it('should verify via verificationId path', async () => {
    const email = 'verify-id@test.ai'

    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: { email, callbackUrl: 'https://example.com/callback' },
    })

    const sent = fastify.fakeEmail?.last()
    const token = sent ? fastify.fakeEmail?.extractToken(sent) : null
    const verificationId = sent ? fastify.fakeEmail?.extractVerificationId(sent) : null
    if (!token || !verificationId) throw new Error('Missing token or verificationId')

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { token, verificationId },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')
  })

  it('should verify valid magic link token and return JWT tokens', async () => {
    const email = 'test@example.com'

    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email,
        callbackUrl: 'https://example.com/callback',
      },
    })

    const token = fastify.fakeEmail?.extractToken()
    expect(token).toBeTruthy()

    const verifyResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })

    expect(verifyResponse.statusCode).toBe(200)

    const body = JSON.parse(verifyResponse.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')
    expect(typeof body.token).toBe('string')
    expect(typeof body.refreshToken).toBe('string')
    expect(body.token.length).toBeGreaterThan(0)
    expect(body.refreshToken.length).toBeGreaterThan(0)

    const db = await getDb()
    const [user] = await db.select().from(users).where(eq(users.email, email))
    expect(user?.emailVerified).toBe(true)
  })

  it('should return error for invalid token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email: 'nonexistent@example.com', token: '000000' },
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('INVALID_TOKEN')
  })

  it('should return EXPIRED_TOKEN for expired verification', async () => {
    const email = 'expired-magic@test.ai'
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: { email, callbackUrl: 'https://example.com/callback' },
    })
    const { token } = await getStoredMagicLink(email)
    if (!token) throw new Error('Missing token')

    const db = await getDb()
    await db
      .update(verification)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(verification.identifier, email))

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('EXPIRED_TOKEN')
  })

  it('should return TOO_MANY_ATTEMPTS after repeated failures', async () => {
    const lockoutIp = `10.0.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`
    const email = `lockout-${lockoutIp}@test.ai`

    for (let i = 0; i < 5; i++) {
      const res = await fastify.inject({
        method: 'POST',
        url: '/auth/magiclink/verify',
        remoteAddress: lockoutIp,
        headers: { 'x-forwarded-for': lockoutIp },
        payload: { email, token: '000000' },
      })
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).code).toBe('INVALID_TOKEN')
    }

    const db = await getDb()
    const [attemptRow] = await db.select().from(authAttempts).where(eq(authAttempts.key, lockoutIp))
    expect(attemptRow?.failedAttempts).toBeGreaterThanOrEqual(5)
    expect(attemptRow?.lockedUntil).toBeTruthy()

    const locked = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      remoteAddress: lockoutIp,
      headers: { 'x-forwarded-for': lockoutIp },
      payload: { email, token: '000000' },
    })
    expect(locked.statusCode).toBe(429)
    expect(JSON.parse(locked.body).code).toBe('TOO_MANY_ATTEMPTS')
  })

  it('should reject legacy SHA-256 stored codes', async () => {
    const email = 'legacy-hash@test.ai'
    const code = '123456'
    const db = await getDb()

    const [user] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email,
        emailVerified: false,
        name: 'Legacy',
        username: `legacy-${Date.now()}`,
      })
      .returning()

    await db.insert(verification).values({
      id: randomUUID(),
      type: 'magic_link',
      identifier: email,
      value: hashToken(code),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token: code },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('INVALID_TOKEN')

    await db.delete(verification).where(eq(verification.identifier, email))
    await db.delete(users).where(eq(users.id, user.id))
  })

  it('should reject reused magic link token', async () => {
    const email = 'reuse-magic@test.ai'
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: { email, callbackUrl: 'https://example.com/callback' },
    })
    const { token } = await getStoredMagicLink(email)
    if (!token) throw new Error('Missing token')

    const first = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    expect(first.statusCode).toBe(200)

    const second = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    expect(second.statusCode).toBe(401)
    expect(JSON.parse(second.body).code).toBe('INVALID_TOKEN')
  })

  it('should return error for missing token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: {},
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).code).toBe('BAD_REQUEST')
  })

  it('should access protected route after magic link authentication', async () => {
    const email = 'test@example.com'

    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email,
        callbackUrl: 'https://example.com/callback',
      },
    })

    const token = fastify.fakeEmail?.extractToken()
    expect(token).toBeTruthy()

    const verifyResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })

    expect(verifyResponse.statusCode).toBe(200)
    const { token: jwtToken } = JSON.parse(verifyResponse.body)
    expect(jwtToken).toBeTruthy()

    const authedResponse = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })

    expect(authedResponse.statusCode).toBe(200)
    const authedBody = JSON.parse(authedResponse.body)
    expect(authedBody).toHaveProperty('user')
    expect(authedBody.user).toHaveProperty('id')
    expect(authedBody.user).toHaveProperty('email')
  })

  it('should complete full authentication flow: send -> verify -> access protected route', async () => {
    const email = 'fullflow@example.com'

    const sendResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email,
        callbackUrl: 'https://example.com/callback',
      },
    })
    expect(sendResponse.statusCode).toBe(200)

    const sentEmail = fastify.fakeEmail?.last()
    expect(sentEmail).toBeDefined()
    expect(sentEmail?.to).toBe(email)

    const magicLink = fastify.fakeEmail?.extractMagicLink()
    expect(magicLink).toBeTruthy()

    const token = fastify.fakeEmail?.extractToken()
    expect(token).toBeTruthy()

    const verifyResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    expect(verifyResponse.statusCode).toBe(200)
    const { token: jwtToken } = JSON.parse(verifyResponse.body)
    expect(jwtToken).toBeTruthy()

    const authedResponse = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })
    expect(authedResponse.statusCode).toBe(200)
    const authedBody = JSON.parse(authedResponse.body)
    expect(authedBody).toHaveProperty('user')
  })
})
