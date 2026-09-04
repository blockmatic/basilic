import { describe, expect, it, vi } from 'vitest'
import { getStoredMagicLink } from '../../../../test/utils/auth-helper.js'
import { fastify } from './sessions.spec.js'

const chromeUa =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function login(email: string) {
  await fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })
  const { token } = await getStoredMagicLink(email)
  return fastify.inject({
    method: 'POST',
    url: '/auth/magiclink/verify',
    headers: { 'user-agent': chromeUa },
    payload: { email, token },
  })
}

describe('POST /auth/sessions/revoke', () => {
  it('revokes the session and is idempotent on a second click', async () => {
    const email = 'sessions-revoke-token@test.ai'
    const verifyRes = await login(email)
    expect(verifyRes.statusCode).toBe(200)
    const { token: jwt } = JSON.parse(verifyRes.body) as { token: string }

    const last = await vi.waitFor(async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: '/test/verification/last',
        query: { type: 'session_revoke', email },
      })
      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body) as { token: string | null; verificationId: string | null }
      expect(body.token).toBeTruthy()
      expect(body.verificationId).toBeTruthy()
      return body as { token: string; verificationId: string }
    })

    const first = await fastify.inject({
      method: 'POST',
      url: '/auth/sessions/revoke',
      payload: { token: last.token, verificationId: last.verificationId },
    })
    expect(first.statusCode).toBe(200)
    expect(JSON.parse(first.body)).toEqual({ ok: true })

    const after = await fastify.inject({
      method: 'GET',
      url: '/auth/sessions',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(after.statusCode).toBe(401)

    const second = await fastify.inject({
      method: 'POST',
      url: '/auth/sessions/revoke',
      payload: { token: last.token, verificationId: last.verificationId },
    })
    expect(second.statusCode).toBe(200)
    expect(JSON.parse(second.body)).toEqual({ ok: true })
  })

  it('returns 401 INVALID_TOKEN for the wrong token', async () => {
    const email = 'sessions-revoke-wrong@test.ai'
    const verifyRes = await login(email)
    expect(verifyRes.statusCode).toBe(200)
    const last = await vi.waitFor(async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: '/test/verification/last',
        query: { type: 'session_revoke', email },
      })
      const body = JSON.parse(res.body) as { token: string | null; verificationId: string | null }
      expect(body.verificationId).toBeTruthy()
      return body as { token: string; verificationId: string }
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/sessions/revoke',
      payload: { token: 'not-the-token', verificationId: last.verificationId },
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).code).toBe('INVALID_TOKEN')
  })
})
