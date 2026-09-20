import { describe, expect, it, vi } from 'vitest'
import { getCandles, getMarkets, getQuote } from './capabilities.js'
import { fixtureQuotes } from './fixture.js'
import * as markets from './index.js'

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

const klineRow = [
  1_499_040_000_000,
  '0.01634790',
  '0.80000000',
  '0.01575800',
  '0.01577100',
  '148976.11427815',
  1_499_644_799_999,
]

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('markets capabilities', () => {
  it('does not export wallet or nft helpers', () => {
    expect(markets).not.toHaveProperty('getWallet')
    expect(markets).not.toHaveProperty('getNfts')
  })

  it('maps frozen CoinGecko markets JSON to a DTO', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(frozenMarkets)),
    )
    const result = await getMarkets({})
    expect(result.source).toBe('live')
    expect(result.markets[0]).toMatchObject({
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      priceUsd: 100,
      change24h: 1.5,
      volumeUsd: 10,
      marketCapUsd: 1_000,
      rank: 1,
      source: 'live',
      provider: 'coingecko',
    })
  })

  it('maps the frozen fixture quotes to a fixture DTO', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse('rate', 429)),
    )
    const result = await getMarkets({})
    expect(result.source).toBe('fixture')
    expect(result.markets.map(row => row.id)).toEqual(fixtureQuotes.map(row => row.id))
    expect(result.markets[0]?.priceUsd).toBe(fixtureQuotes[0].priceUsd)
  })

  it('collapses two concurrent getMarkets calls into one upstream request', async () => {
    let release!: () => void
    const gate = new Promise<void>(resolve => {
      release = resolve
    })
    const fetchMock = vi.fn(async () => {
      await gate
      return jsonResponse(frozenMarkets)
    })
    vi.stubGlobal('fetch', fetchMock)
    const first = getMarkets({})
    const second = getMarkets({})
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    release()
    const [a, b] = await Promise.all([first, second])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(a.markets[0]?.priceUsd).toBe(100)
    expect(b.markets[0]?.priceUsd).toBe(100)
  })

  it('omits per_page when topN is unnamed', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(frozenMarkets))
    vi.stubGlobal('fetch', fetchMock)
    await getMarkets({})
    const url = new URL(requestUrl(fetchMock.mock.calls[0]?.[0] as RequestInfo | URL))
    expect(url.searchParams.has('per_page')).toBe(false)
    expect(url.searchParams.get('vs_currency')).toBe('usd')
  })

  it('skips live CoinGecko after a 429 until the circuit TTL', async () => {
    const fetchMock = vi.fn(async () => jsonResponse('rate', 429))
    vi.stubGlobal('fetch', fetchMock)
    const first = await getMarkets({})
    expect(first.source).toBe('fixture')
    fetchMock.mockClear()
    const second = await getMarkets({})
    expect(second.source).toBe('fixture')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses Binance klines for getCandles when a BTCUSDT mapping is passed', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestUrl(input)
      if (url.includes('/api/v3/klines')) return jsonResponse([klineRow])
      return jsonResponse(frozenMarkets)
    })
    vi.stubGlobal('fetch', fetchMock)
    const result = await getCandles({
      assetId: 'bitcoin',
      mapping: { binanceSymbol: 'BTCUSDT' },
    })
    expect(result.source).toBe('live')
    expect(result.provider).toBe('binance')
    expect(result.candles).toHaveLength(1)
    expect(result.candles[0]?.open).toBe(0.0163479)
    const urls = fetchMock.mock.calls.map(call => requestUrl(call[0]))
    expect(
      urls.some(url => url.includes('data-api.binance.vision') && url.includes('symbol=BTCUSDT')),
    ).toBe(true)
    expect(urls.some(url => url.includes('market_chart'))).toBe(false)
  })

  it('does not call CoinGecko market_chart when no Binance pair is passed', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(frozenMarkets))
    vi.stubGlobal('fetch', fetchMock)
    const result = await getCandles({ assetId: 'bitcoin' })
    expect(result.source).toBe('fixture')
    expect(result.candles).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('always sends symbol on a live Binance ticker/24hr call', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestUrl(input)
      if (url.includes('ticker/24hr'))
        return jsonResponse({
          lastPrice: '67000.00',
          priceChangePercent: '2.14',
          closeTime: Date.parse('2026-01-01T00:00:00.000Z'),
        })
      return jsonResponse({ bitcoin: { usd: 1 } })
    })
    vi.stubGlobal('fetch', fetchMock)
    const quote = await getQuote({
      assetId: 'bitcoin',
      mapping: { binanceSymbol: 'BTCUSDT' },
    })
    expect(quote.provider).toBe('binance')
    expect(quote.price).toBe(67_000)
    const tickerCalls = fetchMock.mock.calls
      .map(call => requestUrl(call[0]))
      .filter(url => url.includes('ticker/24hr'))
    expect(tickerCalls).toHaveLength(1)
    expect(new URL(tickerCalls[0] ?? '').searchParams.get('symbol')).toBe('BTCUSDT')
  })
})
