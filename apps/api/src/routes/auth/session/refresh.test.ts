import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../session.spec.js'

describe('POST /auth/session/refresh', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should refresh token and return 200 { token, refreshToken }', async () => {
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

    const { token: jwtToken, refreshToken } = JSON.parse(verifyResponse.body)
    expect(jwtToken).toBeTruthy()
    expect(refreshToken).toBeTruthy()

    const refreshResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: {
        refreshToken,
      },
    })

    expect(refreshResponse.statusCode).toBe(200)
    const refreshBody = JSON.parse(refreshResponse.body)
    expect(refreshBody).toHaveProperty('token')
    expect(refreshBody).toHaveProperty('refreshToken')
    expect(typeof refreshBody.token).toBe('string')
    expect(typeof refreshBody.refreshToken).toBe('string')
  })
})
