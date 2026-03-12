import { describe, expect, it } from 'vitest'
import { fastify } from '../../oauth.spec.js'

describe('POST /auth/oauth/github/exchange', () => {
  it('returns 503 when GitHub OAuth is not configured', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/oauth/github/exchange',
      payload: { code: 'test-code', state: 'test-state' },
    })
    expect(res.statusCode).toBe(503)
    const body = res.json() as { code?: string; message?: string }
    expect(body.code).toBe('OAUTH_NOT_CONFIGURED')
  })
})
