import { resetCoinGeckoClient, resetMarketsRuntime } from '@repo/markets'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateSession } from '../../../test/utils/auth-helper.js'
import { fastify } from './coins.spec.js'

const frozenMarkets = Object.freeze([
  Object.freeze({
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/btc.png',
    current_price: 100,
    price_change_percentage_24h: 1.5,
    total_volume: 10,
    market_cap: 1_000,
    market_cap_rank: 1,
    last_updated: '2026-01-01T00:00:00.000Z',
  }),
])

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('GET /coins', () => {
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
      url: '/coins',
    })
    expect(response.statusCode).toBe(401)
    const body = response.json()
    expect(body.code).toBe('UNAUTHORIZED')
    const challenge = String(response.headers['www-authenticate'] ?? '')
    expect(challenge).toContain('Bearer')
    expect(challenge).toContain('ApiKey')
  })

  it('returns live ranks and collapses a burst into one CoinGecko fetch', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-list@test.ai')
    const fetchMock = vi.fn(async () => jsonResponse(frozenMarkets))
    vi.stubGlobal('fetch', fetchMock)

    const first = await fastify.inject({
      method: 'GET',
      url: '/coins',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(first.statusCode).toBe(200)
    const body = first.json() as {
      coins: { id: string; rank: number; priceUsd: number; fetchedAt: string }[]
      sync: { source: string; fetchedAt: string | null; attribution?: string }
    }
    expect(body.sync.source).toBe('live')
    expect(body.sync.attribution).toBe('Data by CoinGecko')
    expect(body.sync.fetchedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(body.coins).toEqual([
      expect.objectContaining({
        id: 'bitcoin',
        rank: 1,
        priceUsd: 100,
        fetchedAt: '2026-01-01T00:00:00.000Z',
      }),
    ])

    const burst = await Promise.all(
      Array.from({ length: 5 }, () =>
        fastify.inject({
          method: 'GET',
          url: '/coins',
          headers: { Authorization: `Bearer ${jwt}` },
        }),
      ),
    )
    expect(burst.every(response => response.statusCode === 200)).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('accepts the generated client trailing slash', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-list@test.ai')
    const fetchMock = vi.fn(async () => jsonResponse(frozenMarkets))
    vi.stubGlobal('fetch', fetchMock)
    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
  })
})
