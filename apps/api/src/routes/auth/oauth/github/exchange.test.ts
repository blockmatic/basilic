import { describe, expect, it } from 'vitest'
import { fastify } from '../../oauth.spec.js'
import { resolveGitHubVerifiedEmail } from './exchange.js'

describe('resolveGitHubVerifiedEmail', () => {
  it('ignores unverified primary and returns verified email', () => {
    const email = resolveGitHubVerifiedEmail([
      { email: 'unverified@example.com', primary: true, verified: false },
      { email: 'verified@example.com', primary: false, verified: true },
    ])
    expect(email).toBe('verified@example.com')
  })

  it('prefers verified primary when present', () => {
    const email = resolveGitHubVerifiedEmail([
      { email: 'primary@example.com', primary: true, verified: true },
      { email: 'other@example.com', primary: false, verified: true },
    ])
    expect(email).toBe('primary@example.com')
  })

  it('returns empty when no verified emails', () => {
    expect(
      resolveGitHubVerifiedEmail([
        { email: 'unverified@example.com', primary: true, verified: false },
      ]),
    ).toBe('')
  })
})

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
