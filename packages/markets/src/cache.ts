import { logger } from '@repo/utils/logger/server'
import { configureMarkets as setMarketsConfig, takeConfiguredCache } from './config.js'
import { vendorStatus } from './policy.js'
import type { CachePort, CacheRecord, Provenance, Vendor } from './types.js'

type Circuit = { consecutive429: number; openUntil: number }

type MarketsRuntime = {
  cache: CachePort
  inflight: Map<string, Promise<unknown>>
  circuits: Record<Vendor, Circuit>
}

export function createMemoryCache(): CachePort & { clear: () => void } {
  const store = new Map<string, CacheRecord>()
  return {
    get: key => store.get(key),
    set: (key, record) => {
      store.set(key, record)
    },
    clear: () => store.clear(),
  }
}

function emptyCircuits(): Record<Vendor, Circuit> {
  return {
    coingecko: { consecutive429: 0, openUntil: 0 },
    binance: { consecutive429: 0, openUntil: 0 },
  }
}

export function createMarketsRuntime({
  cache = takeConfiguredCache() ?? createMemoryCache(),
}: {
  cache?: CachePort
} = {}): MarketsRuntime {
  return { cache, inflight: new Map(), circuits: emptyCircuits() }
}

function getRuntime(): MarketsRuntime {
  const g = globalThis as { __basilicMarketsRuntime?: MarketsRuntime }
  g.__basilicMarketsRuntime ??= createMarketsRuntime()
  return g.__basilicMarketsRuntime
}

function setRuntime(next: MarketsRuntime): void {
  const g = globalThis as { __basilicMarketsRuntime?: MarketsRuntime }
  g.__basilicMarketsRuntime = next
}

export function configureMarkets({
  cache,
  coinGeckoDemoApiKey,
  coinsUseFixture,
  cacheMs,
  quoteCacheMs,
  klinesCacheMs,
}: {
  cache?: CachePort
  coinGeckoDemoApiKey?: string
  coinsUseFixture?: boolean
  cacheMs?: number
  quoteCacheMs?: number
  klinesCacheMs?: number
} = {}): void {
  setMarketsConfig({
    cache,
    coinGeckoDemoApiKey,
    coinsUseFixture,
    cacheMs,
    quoteCacheMs,
    klinesCacheMs,
  })
  if (cache) setRuntime({ ...getRuntime(), cache })
}

export function resetMarketsRuntime(): void {
  setRuntime(createMarketsRuntime())
}

export function cacheKey(capability: string, params: Record<string, unknown>): string {
  const canonical: Record<string, unknown> = {}
  for (const key of Object.keys(params).sort()) {
    const value = params[key]
    if (value === undefined) continue
    canonical[key] = value
  }
  return `${capability}:${JSON.stringify(canonical)}`
}

function isFresh(record: CacheRecord, now: number): boolean {
  return record.expiresAt > now
}

function rewriteSource<T>(value: T, source: Provenance): T {
  if (typeof value !== 'object' || value === null) return value
  const record = value as Record<string, unknown>
  const next: Record<string, unknown> = { ...record, source }
  if (Array.isArray(record.markets))
    next.markets = record.markets.map(row =>
      typeof row === 'object' && row !== null ? { ...row, source } : row,
    )
  if (Array.isArray(record.coins))
    next.coins = record.coins.map(row =>
      typeof row === 'object' && row !== null ? { ...row, source } : row,
    )
  return next as T
}

async function singleflight<T>({ key, load }: { key: string; load: () => Promise<T> }): Promise<T> {
  const runtime = getRuntime()
  const existing = runtime.inflight.get(key)
  if (existing) return existing as Promise<T>
  const pending = load().finally(() => runtime.inflight.delete(key))
  runtime.inflight.set(key, pending)
  return pending
}

export async function withVendorCache<T>({
  key,
  ttlMs,
  vendor,
  load,
  fallback,
}: {
  key: string
  ttlMs: number
  vendor: Vendor
  load: () => Promise<T>
  fallback: () => T
}): Promise<T> {
  const runtime = getRuntime()
  const now = Date.now()
  const circuit = runtime.circuits[vendor]
  const cached = await runtime.cache.get(key)

  if (circuit.openUntil > now) {
    if (cached) return rewriteSource(cached.value as T, 'stale')
    return fallback()
  }

  if (cached && isFresh(cached, now)) return cached.value as T

  try {
    const value = await singleflight({
      key,
      load: async () => {
        const live = await load()
        await runtime.cache.set(key, { value: live, expiresAt: Date.now() + ttlMs })
        runtime.circuits[vendor] = { consecutive429: 0, openUntil: 0 }
        return live
      },
    })
    return value
  } catch (err) {
    const status = vendorStatus(err)
    if (status === 429) {
      const consecutive429 = circuit.consecutive429 + 1
      runtime.circuits[vendor] = {
        consecutive429,
        openUntil: Date.now() + ttlMs,
      }
      logger.warn({ vendor, status, key }, 'markets vendor 429; circuit open')
    } else {
      logger.warn({ err, vendor, key }, 'markets vendor fetch failed')
    }
    if (cached) return rewriteSource(cached.value as T, 'stale')
    return fallback()
  }
}
