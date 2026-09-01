import { describe, expect, it } from 'vitest'
import { fastify } from '../../oauth.spec.js'

describe('POST /auth/oauth/google/exchange', () => {
  it('returns 503 when Google OAuth redirect is not configured', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/oauth/google/exchange',
      payload: { code: 'test', state: 'test' },
    })
    expect(res.statusCode).toBe(503)
    const body = res.json() as { code?: string; message?: string }
    expect(body.code).toBe('OAUTH_NOT_CONFIGURED')
  })
})
