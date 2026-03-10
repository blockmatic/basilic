import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../link.spec.js'

describe('POST /auth/link/verify', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should verify token and return 200 { token } JSON (no redirects)', async () => {
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
    expect(typeof body.token).toBe('string')
    expect(body.token.length).toBeGreaterThan(0)

    expect(verifyResponse.statusCode).not.toBe(302)
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
})
