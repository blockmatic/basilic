import { describe, expect, it } from 'vitest'
import { getMagicLinkTokenRaw } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../session.spec.js'

describe('POST /auth/session/refresh', () => {
  it('should refresh token and return 200 { token, refreshToken }', async () => {
    const email = 'refresh-happy@test.ai'
    const token = await getMagicLinkTokenRaw(fastify, email)

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
    const token = await getMagicLinkTokenRaw(fastify, email)

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

  it('should return INVALID_TOKEN when access token is used as refresh token', async () => {
    const email = 'refresh-access-as-refresh@test.ai'
    const token = await getMagicLinkTokenRaw(fastify, email)

    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email, token },
    })
    const { token: accessToken } = JSON.parse(verifyRes.body) as { token: string }

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/session/refresh',
      payload: { refreshToken: accessToken },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('INVALID_TOKEN')
  })
})
