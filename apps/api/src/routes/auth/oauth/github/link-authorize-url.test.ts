import { describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../oauth.spec.js'

describe('GET /auth/oauth/github/link-authorize-url', () => {
  it('returns 401 without Bearer token', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/auth/oauth/github/link-authorize-url',
    })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('returns 503 when GitHub OAuth is not configured', async () => {
    const jwt = await getOrCreateSession(fastify, 'github-link@test.ai')
    const res = await fastify.inject({
      method: 'GET',
      url: '/auth/oauth/github/link-authorize-url',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(res.statusCode).toBe(503)
    expect(res.json()).toMatchObject({ code: 'OAUTH_NOT_CONFIGURED' })
  })
})
