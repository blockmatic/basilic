import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from './test.spec.js'

describe('GET /test/authed', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
    })

    expect(response.statusCode).toBe(401)
    const body = response.json()
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('should return user info when authenticated', async () => {
    const email = 'test@example.com'
    const callbackUrl = 'https://example.com/callback'

    // Request magic link
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email,
        callbackUrl,
      },
    })

    // Extract token
    const token = fastify.fakeEmail?.extractToken()
    expect(token).toBeTruthy()

    if (!token) {
      throw new Error('Failed to extract token')
    }

    // Verify magic link to get JWT
    const verifyResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: {
        token,
      },
    })

    expect(verifyResponse.statusCode).toBe(200)
    const verifyBody = verifyResponse.json()
    const accessToken = verifyBody.token

    // Call authenticated endpoint
    const response = await fastify.inject({
      method: 'GET',
      url: '/test/authed',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.user).toBeDefined()
    expect(body.user.id).toBeTruthy()
    expect(body.user.email).toBe(email)
  })
})
