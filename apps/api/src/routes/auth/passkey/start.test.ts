import { describe, expect, it } from 'vitest'
import { fastify } from './passkey.spec.js'

describe('POST /auth/passkey/start', () => {
  it('should return 400 for missing Origin', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
    })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toMatchObject({
      code: 'INVALID_ORIGIN',
      message: 'Invalid or missing Origin header',
    })
  })

  it('should return 400 for invalid Origin', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
      headers: { origin: 'javascript:alert(1)' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('should return 400 for disallowed origin', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
      headers: { origin: 'http://evil.example' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('should return 200 with options and sessionId when Origin is valid', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
      headers: { origin: 'http://localhost:3000' },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body).toHaveProperty('options')
    expect(body.options).toHaveProperty('challenge')
    expect(body.sessionId).toBeDefined()
    expect(typeof body.sessionId).toBe('string')
    expect(body.sessionId.length).toBeGreaterThan(0)
  })
})
