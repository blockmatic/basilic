import { describe, expect, it } from 'vitest'
import { fastify } from '../oauth.spec.js'

describe('GET /auth/oauth/providers', () => {
  it('returns which OAuth providers are configured', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/auth/oauth/providers',
    })
    expect(res.statusCode).toBe(200)
    const body = res.json() as {
      github: boolean
      google: boolean
      facebook: boolean
      twitter: boolean
    }
    expect(typeof body.github).toBe('boolean')
    expect(typeof body.google).toBe('boolean')
    expect(typeof body.facebook).toBe('boolean')
    expect(typeof body.twitter).toBe('boolean')
  })
})
