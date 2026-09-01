import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../magiclink.spec.js'

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

  it('should return error for missing token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: {},
    })

    expect([400, 401, 404]).toContain(response.statusCode)
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
