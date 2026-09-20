import { afterEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateSession } from '../../../test/utils/auth-helper.js'
import { mockMarketRows } from '../../lib/coins/index.js'
import { fastify } from './coins.spec.js'

describe('GET /coins', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/coins',
    })
    expect(response.statusCode).toBe(401)
    const body = response.json()
    expect(body.code).toBe('UNAUTHORIZED')
    const challenge = String(response.headers['www-authenticate'] ?? '')
    expect(challenge).toContain('Bearer')
    expect(challenge).toContain('ApiKey')
  })

  it('returns seeded snapshot without network', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-list@test.ai')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await fastify.inject({
      method: 'GET',
      url: '/coins',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(0)
    const body = response.json() as {
      coins: { id: string }[]
      sync: { source: string; fetchedAt: string | null; lastError: string | null }
    }
    expect(body.coins.map(coin => coin.id)).toEqual(mockMarketRows.map(row => row.id))
    expect(body.sync).toEqual({ source: 'mock', fetchedAt: null, lastError: null })
  })

  it('accepts the generated client trailing slash', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-list@test.ai')
    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
  })
})
