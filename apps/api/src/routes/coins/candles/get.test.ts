import { getDb } from '@repo/db'
import { assets } from '@repo/db/schema'
import { resetCoinGeckoClient, resetMarketsRuntime } from '@repo/markets'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateSession } from '../../../../test/utils/auth-helper.js'
import { seedIdentity } from '../../../lib/coins/index.js'
import { fastify } from '../coins.spec.js'

const klineRow = [
  1_499_040_000_000,
  '0.01634790',
  '0.80000000',
  '0.01575800',
  '0.01577100',
  '148976.11427815',
  1_499_644_799_999,
]

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

describe('GET /coins/:assetId/candles', () => {
  beforeEach(async () => {
    resetMarketsRuntime()
    resetCoinGeckoClient()
    await seedIdentity({ db: await getDb() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/bitcoin/candles',
    })
    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('stubs klines into a live DTO and maps 7d onto interval 1h with limit 168', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-candles@test.ai')
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestUrl(input)
      if (url.includes('/api/v3/klines')) return jsonResponse([klineRow])
      return jsonResponse([])
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/bitcoin/candles?period=7d',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    const body = response.json() as {
      assetId: string
      interval: string
      source: string
      provider: string
      candles: { open: number }[]
    }
    expect(body).toMatchObject({
      assetId: 'bitcoin',
      interval: '1h',
      source: 'live',
      provider: 'binance',
    })
    expect(body.candles).toEqual([expect.objectContaining({ open: 0.0163479 })])
    const url = requestUrl(fetchMock.mock.calls[0]?.[0] as RequestInfo | URL)
    expect(url).toContain('data-api.binance.vision')
    expect(url).toContain('symbol=BTCUSDT')
    expect(url).toContain('interval=1h')
    expect(url).toContain('limit=168')
    expect(url).not.toContain('interval=7d')
  })

  it('returns HTTP 200 fixture candles when the asset has no Binance market', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-candles@test.ai')
    const db = await getDb()
    const now = new Date()
    await db.insert(assets).values({
      id: 'unmapped',
      symbol: 'zzz',
      name: 'Unmapped',
      enabled: true,
      createdAt: now,
      updatedAt: now,
    })
    const fetchMock = vi.fn(async () => jsonResponse([klineRow]))
    vi.stubGlobal('fetch', fetchMock)

    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/unmapped/candles',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      assetId: 'unmapped',
      source: 'fixture',
      provider: 'fixture',
      candles: [],
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
