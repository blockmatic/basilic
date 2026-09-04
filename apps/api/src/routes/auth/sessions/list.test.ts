import { describe, expect, it } from 'vitest'
import {
  getApiKeyToken,
  getOrCreateSession,
  getWeb3Session,
} from '../../../../test/utils/auth-helper.js'
import { fastify } from './sessions.spec.js'

const chromeUa =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

describe('GET /auth/sessions', () => {
  it('returns 401 without Bearer token', async () => {
    const response = await fastify.inject({ method: 'GET', url: '/auth/sessions' })
    expect(response.statusCode).toBe(401)
  })

  it('returns 400 USE_KEY_REVOKE for API keys', async () => {
    const apiKey = await getApiKeyToken(fastify, 'sessions-list-apikey@test.ai')
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/sessions',
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).code).toBe('USE_KEY_REVOKE')
  })

  it('lists current session metadata without ua or fingerprint', async () => {
    const jwt = await getOrCreateSession(fastify, 'sessions-list@test.ai')
    const response = await fastify.inject({
      method: 'GET',
      url: '/auth/sessions',
      headers: { Authorization: `Bearer ${jwt}`, 'user-agent': chromeUa },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body) as {
      sessions: Record<string, unknown>[]
    }
    expect(body.sessions.length).toBeGreaterThanOrEqual(1)
    const current = body.sessions.find(s => s.isCurrent === true)
    expect(current).toBeDefined()
    expect(current).not.toHaveProperty('userAgent')
    expect(current).not.toHaveProperty('deviceFingerprint')
    expect(typeof current?.createdAt).toBe('string')
  })

  it('does not email web3 users without an inbox', async () => {
    const before = fastify.fakeEmail?.all().length ?? 0
    await getWeb3Session(fastify)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(fastify.fakeEmail?.all().length ?? 0).toBe(before)
  })
})
