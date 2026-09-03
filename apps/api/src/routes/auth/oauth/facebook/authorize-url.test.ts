import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../../lib/env.js', async importOriginal => {
  const actual = (await importOriginal()) as { env: Record<string, unknown> }
  return {
    env: {
      ...actual.env,
      FACEBOOK_CLIENT_ID: undefined,
      FACEBOOK_CLIENT_SECRET: undefined,
      OAUTH_FACEBOOK_CALLBACK_URL: undefined,
      OAUTH_FACEBOOK_CALLBACK_URLS: undefined,
    },
  }
})

import { fastify } from '../oauth.spec.js'

describe('GET /auth/oauth/facebook/authorize-url', () => {
  it('returns 503 when Facebook OAuth is not configured', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/auth/oauth/facebook/authorize-url',
    })
    expect(res.statusCode).toBe(503)
    const body = res.json() as { code?: string; message?: string }
    expect(body.code).toBe('OAUTH_NOT_CONFIGURED')
  })
})
