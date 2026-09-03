import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../../lib/env.js', async importOriginal => {
  const actual = (await importOriginal()) as { env: Record<string, unknown> }
  return {
    env: {
      ...actual.env,
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      OAUTH_GOOGLE_CALLBACK_URL: undefined,
      OAUTH_GOOGLE_CALLBACK_URLS: undefined,
    },
  }
})

import { fastify } from '../oauth.spec.js'

describe('GET /auth/oauth/google/authorize-url', () => {
  it('returns 503 when Google OAuth redirect is not configured', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/auth/oauth/google/authorize-url',
    })
    expect(res.statusCode).toBe(503)
    const body = res.json() as { code?: string; message?: string }
    expect(body.code).toBe('OAUTH_NOT_CONFIGURED')
  })
})
