import { logger } from '@repo/utils/logger/server'
import { binanceOrigin, fetchAllowed } from './policy.js'
import type { Candle, Quote } from './types.js'

const tickerPath = '/api/v3/ticker/24hr'
const klinesPath = '/api/v3/klines'

export function buildTickerUrl({ symbol }: { symbol: string }): string {
  if (!symbol) throw new Error('Binance ticker/24hr requires symbol')
  const url = new URL(tickerPath, binanceOrigin)
  url.searchParams.set('symbol', symbol)
  return url.href
}

export function buildKlinesUrl({
  symbol,
  interval,
  range,
}: {
  symbol: string
  interval?: string
  range?: string
}): string {
  if (!symbol) throw new Error('Binance klines requires symbol')
  const url = new URL(klinesPath, binanceOrigin)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('interval', interval ?? '1h')
  if (range)
    url.searchParams.set('limit', String(klineLimit({ interval: interval ?? '1h', range })))
  return url.href
}

function klineLimit({ interval, range }: { interval: string; range: string }): number {
  const intervalMs = intervalToMs(interval)
  const rangeMs = intervalToMs(range)
  if (!intervalMs || !rangeMs) return 24
  return Math.min(1000, Math.max(1, Math.ceil(rangeMs / intervalMs)))
}

function intervalToMs(value: string): number | undefined {
  const match = /^(\d+)([mhdw])$/i.exec(value)
  if (!match) return undefined
  const amount = Number(match[1])
  const unit = match[2]?.toLowerCase()
  if (unit === 'm') return amount * 60_000
  if (unit === 'h') return amount * 3_600_000
  if (unit === 'd') return amount * 86_400_000
  if (unit === 'w') return amount * 604_800_000
  return undefined
}

function throwVendor({ status, message }: { status: number; message: string }): never {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  throw err
}

async function readJson(response: Response): Promise<unknown> {
  if (response.status === 429) throwVendor({ status: 429, message: 'binance 429' })
  if (!response.ok) throwVendor({ status: response.status, message: `binance ${response.status}` })
  return response.json()
}

export async function fetchBinanceTicker({ symbol }: { symbol: string }): Promise<{
  price: number
  change24h: number
  fetchedAt: string
}> {
  const url = buildTickerUrl({ symbol })
  const payload = await readJson(await fetchAllowed(url))
  if (typeof payload !== 'object' || payload === null) throw new Error('binance ticker shape')
  const row = payload as { lastPrice?: string; priceChangePercent?: string; closeTime?: number }
  const price = Number(row.lastPrice)
  if (!Number.isFinite(price)) throw new Error('binance ticker price')
  const change24h = Number(row.priceChangePercent)
  const fetchedAt =
    typeof row.closeTime === 'number'
      ? new Date(row.closeTime).toISOString()
      : new Date().toISOString()
  return { price, change24h: Number.isFinite(change24h) ? change24h : 0, fetchedAt }
}

export async function fetchBinanceKlines({
  symbol,
  interval,
  range,
}: {
  symbol: string
  interval?: string
  range?: string
}): Promise<Candle[]> {
  const url = buildKlinesUrl({ symbol, interval, range })
  const payload = await readJson(await fetchAllowed(url))
  if (!Array.isArray(payload)) throw new Error('binance klines shape')
  return payload.flatMap(row => {
    if (!Array.isArray(row) || row.length < 7) return []
    const openTime = Number(row[0])
    const open = Number(row[1])
    const high = Number(row[2])
    const low = Number(row[3])
    const close = Number(row[4])
    const volume = Number(row[5])
    const closeTime = Number(row[6])
    if (![openTime, open, high, low, close, volume, closeTime].every(Number.isFinite)) return []
    return [{ openTime, open, high, low, close, volume, closeTime }]
  })
}

export function tickerToQuote({
  assetId,
  vs,
  ticker,
}: {
  assetId: string
  vs: string
  ticker: { price: number; change24h: number; fetchedAt: string }
}): Quote {
  return {
    assetId,
    vs,
    price: ticker.price,
    change24h: ticker.change24h,
    fetchedAt: ticker.fetchedAt,
    source: 'live',
    provider: 'binance',
  }
}

export function logBinanceSkip({ assetId, reason }: { assetId: string; reason: string }): void {
  logger.warn({ assetId, reason }, 'markets binance skipped')
}
