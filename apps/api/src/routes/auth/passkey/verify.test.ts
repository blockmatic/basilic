import { describe, expect, it } from 'vitest'
import { fastify } from '../passkey.spec.js'

const minimalAssertion = {
  id: 'fake',
  rawId: 'fake',
  response: {
    clientDataJSON: 'fake',
    authenticatorData: 'fake',
    signature: 'fake',
  },
  type: 'public-key' as const,
}

describe('POST /auth/passkey/verify', () => {
  it('should return 400 when sessionId is missing', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/verify',
      headers: { origin: 'http://localhost:3000' },
      payload: { assertion: minimalAssertion },
    })
    expect(res.statusCode).toBe(400)
    const body = res.json()
    expect(body).toMatchObject({
      code: expect.stringMatching(/BAD_REQUEST|FST_ERR_VALIDATION|VALIDATION/),
      message: expect.any(String),
    })
  })

  it('should return 401 when sessionId does not match any challenge', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/verify',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        assertion: minimalAssertion,
        sessionId: 'non-existent-session-id',
      },
    })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toMatchObject({
      code: 'EXPIRED_CHALLENGE',
      message: 'Challenge expired or not found',
    })
  })

  it('should return 400 for invalid callbackUrl', async () => {
    const startRes = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
      headers: { origin: 'http://localhost:3000' },
    })
    expect(startRes.statusCode).toBe(200)
    const { sessionId } = startRes.json() as { sessionId: string }
    expect(sessionId).toBeDefined()

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/verify',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        assertion: minimalAssertion,
        sessionId,
        callbackUrl: 'javascript:alert(1)',
      },
    })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toMatchObject({
      code: 'INVALID_CALLBACK_URL',
      message: 'Callback URL origin is not allowed',
    })
  })
})
