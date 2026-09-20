import { getDb } from '@repo/db'
import { assetMarkets, assetNetworks, assetProviders, assets, coinWatches } from '@repo/db/schema'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fixtureQuotes, resetCoinGeckoClient, resetMarketsRuntime } from '../markets/index.js'
import { listMarkets } from './read.js'

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

describe('listMarkets', () => {
  beforeEach(() => {
    resetMarketsRuntime()
    resetCoinGeckoClient()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('seeds identity and returns fixture quotes when CoinGecko 429s', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse('rate', 429)),
    )
    const db = await getDb()
    await db.delete(coinWatches)
    await db.delete(assetMarkets)
    await db.delete(assetNetworks)
    await db.delete(assetProviders)
    await db.delete(assets)

    const result = await listMarkets({ db })
    expect(result.coins.map(coin => coin.id)).toEqual(fixtureQuotes.map(row => row.id))
    expect(result.sync.source).toBe('fixture')
    expect(result.sync.fetchedAt).toBeNull()
    expect(result.sync.lastError).toBeNull()
    expect(result.coins[0]?.priceUsd).toBe(fixtureQuotes[0].priceUsd)
  })

  it('joins live CoinGecko ranks onto identity assets', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(frozenMarkets)),
    )
    const db = await getDb()
    const result = await listMarkets({ db })
    expect(result.sync.source).toBe('live')
    expect(result.sync.attribution).toBe('Data by CoinGecko')
    expect(result.sync.fetchedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(result.coins).toEqual([
      expect.objectContaining({
        id: 'bitcoin',
        rank: 1,
        priceUsd: 100,
        fetchedAt: '2026-01-01T00:00:00.000Z',
      }),
    ])
  })

  it('collapses concurrent listMarkets calls into one CoinGecko fetch', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(frozenMarkets))
    vi.stubGlobal('fetch', fetchMock)
    const db = await getDb()
    const [first, second] = await Promise.all([listMarkets({ db }), listMarkets({ db })])
    expect(first.sync.source).toBe('live')
    expect(second.sync.source).toBe('live')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
