import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../magiclink.spec.js'

describe('POST /auth/magiclink/verify', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
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
      payload: {
        token,
      },
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
      payload: {
        token: '000000',
      },
    })

    expect([400, 401, 404]).toContain(response.statusCode)
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
      payload: {
        token,
      },
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
      payload: {
        token,
      },
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
