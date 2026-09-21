import { resetCoinGeckoClient, resetMarketsRuntime } from '@repo/markets'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateSession } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../coins.spec.js'

describe('GET /coins/trending', () => {
  beforeEach(() => {
    resetMarketsRuntime()
    resetCoinGeckoClient()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/trending',
    })
    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('returns HTTP 200 fixture trending when CoinGecko fails', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-trending@test.ai')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )

    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/trending',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    const body = response.json() as { source: string; coins: { id: string }[] }
    expect(body.source).toBe('fixture')
    expect(body.coins.length).toBeGreaterThan(0)
    expect(body.coins[0]).toMatchObject({ id: expect.any(String), symbol: expect.any(String) })
  })
})
