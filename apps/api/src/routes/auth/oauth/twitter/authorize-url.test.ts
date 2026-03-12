import { describe, expect, it } from 'vitest'
import { fastify } from '../../oauth.spec.js'

describe('GET /auth/oauth/twitter/authorize-url', () => {
  it('returns 503 when Twitter OAuth is not configured', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/auth/oauth/twitter/authorize-url',
    })
    expect(res.statusCode).toBe(503)
    const body = res.json() as { code?: string; message?: string }
    expect(body.code).toBe('OAUTH_NOT_CONFIGURED')
  })
})
