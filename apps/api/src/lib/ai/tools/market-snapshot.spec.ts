import { fixtureMarkets, resetCoinGeckoClient, resetMarketsRuntime } from '@repo/markets'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadMarketRows } from './market-snapshot.js'

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

describe('loadMarketRows', () => {
  beforeEach(() => {
    resetMarketsRuntime()
    resetCoinGeckoClient()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns fixture without fetching when the signal is already aborted', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    controller.abort()
    const { source, rows } = await loadMarketRows(controller.signal)
    expect(source).toBe('fixture')
    expect(rows.map(row => row.id)).toEqual(fixtureMarkets().markets.map(row => row.id))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reuses the getMarkets cache across snapshot loads', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(frozenMarkets))
    vi.stubGlobal('fetch', fetchMock)
    const first = await loadMarketRows()
    const second = await loadMarketRows()
    expect(first.source).toBe('live')
    expect(second.source).toBe('live')
    expect(first.rows[0]?.currentPrice).toBe(100)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
