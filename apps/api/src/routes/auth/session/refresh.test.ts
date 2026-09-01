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

  it('should return TOKEN_REUSE_DETECTED and revoke session on refresh replay', async () => {
    const email = 'refresh-reuse@test.ai'

    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: { email, callbackUrl: 'https://example.com/callback' },
    })
    const token = fastify.fakeEmail?.extractToken()
    if (!token) throw new Error('No token')

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    const { refreshToken: originalRefresh } = JSON.parse(verifyRes.body) as { refreshToken: string }

    const firstRefresh = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken: originalRefresh },
    })
    expect(firstRefresh.statusCode).toBe(200)

    const reuseRes = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken: originalRefresh },
    })
    expect(reuseRes.statusCode).toBe(401)
    expect(JSON.parse(reuseRes.body).code).toBe('TOKEN_REUSE_DETECTED')

    const { refreshToken: rotatedRefresh } = JSON.parse(firstRefresh.body) as {
      refreshToken: string
    }
    const afterRevoke = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken: rotatedRefresh },
    })
    expect(afterRevoke.statusCode).toBe(401)
    expect(JSON.parse(afterRevoke.body).code).toBe('SESSION_NOT_FOUND')
  })
})
