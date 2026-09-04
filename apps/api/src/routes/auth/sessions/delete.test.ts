import { describe, expect, it } from 'vitest'
import { getOrCreateSession, getStoredMagicLink } from '../../../../test/utils/auth-helper.js'
import { fastify } from './sessions.spec.js'

function sidFromJwt(jwt: string) {
  const payload = jwt.split('.')[1]
  if (!payload) throw new Error('invalid jwt')
  return (JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sid: string }).sid
}

describe('DELETE /auth/sessions/:id', () => {
  it('returns 404 for another user’s session', async () => {
    const aliceJwt = await getOrCreateSession(fastify, 'sessions-delete-alice@test.ai')
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email: 'sessions-delete-bob@test.ai',
        callbackUrl: 'https://example.com/callback',
      },
    })
    const { token } = await getStoredMagicLink('sessions-delete-bob@test.ai')
    const bobRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email: 'sessions-delete-bob@test.ai', token },
    })
    expect(bobRes.statusCode).toBe(200)
    const { token: bobJwt } = JSON.parse(bobRes.body) as { token: string }
    const bobSid = sidFromJwt(bobJwt)

    const res = await fastify.inject({
      method: 'DELETE',
      url: `/auth/sessions/${bobSid}`,
      headers: { Authorization: `Bearer ${aliceJwt}` },
    })
    expect(res.statusCode).toBe(404)
  })

  it('revokes own session with 204', async () => {
    await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/request',
      payload: {
        email: 'sessions-delete-own@test.ai',
        callbackUrl: 'https://example.com/callback',
      },
    })
    const { token } = await getStoredMagicLink('sessions-delete-own@test.ai')
    const verifyRes = await fastify.inject({
      method: 'POST',
      url: '/auth/magiclink/verify',
      payload: { email: 'sessions-delete-own@test.ai', token },
    })
    const { token: jwt } = JSON.parse(verifyRes.body) as { token: string }
    const sid = sidFromJwt(jwt)

    const res = await fastify.inject({
      method: 'DELETE',
      url: `/auth/sessions/${sid}`,
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(204)

    const after = await fastify.inject({
      method: 'GET',
      url: '/auth/sessions',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(after.statusCode).toBe(401)
  })
})
