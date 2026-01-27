import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../session.spec.js'

describe('POST /auth/session/logout', () => {
  beforeEach(() => {
    fastify.fakeEmail?.clear()
  })

  it('should logout user and return 204 or 200 { ok: true }', async () => {
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

    const { token: jwtToken } = JSON.parse(verifyResponse.body)
    expect(jwtToken).toBeTruthy()

    const logoutResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/session/logout',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })

    expect([200, 204]).toContain(logoutResponse.statusCode)
    if (logoutResponse.statusCode === 200) {
      const body = JSON.parse(logoutResponse.body)
      expect(body).toMatchObject({ ok: true })
    }
  })
})
