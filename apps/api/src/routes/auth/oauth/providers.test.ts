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
      githubHasRedirectConfig: boolean
      google: boolean
      googleHasRedirectConfig: boolean
      facebook: boolean
      facebookHasRedirectConfig: boolean
      twitter: boolean
      twitterHasRedirectConfig: boolean
    }
    expect(typeof body.github).toBe('boolean')
    expect(typeof body.githubHasRedirectConfig).toBe('boolean')
    expect(typeof body.google).toBe('boolean')
    expect(typeof body.googleHasRedirectConfig).toBe('boolean')
    expect(typeof body.facebook).toBe('boolean')
    expect(typeof body.facebookHasRedirectConfig).toBe('boolean')
    expect(typeof body.twitter).toBe('boolean')
    expect(typeof body.twitterHasRedirectConfig).toBe('boolean')
  })
})
