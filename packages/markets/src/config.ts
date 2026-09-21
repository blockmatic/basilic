import type { CachePort } from './types.js'

export type MarketsConfig = {
  coinGeckoDemoApiKey?: string
  coinsUseFixture: boolean
  cacheMs: number
  quoteCacheMs: number
  klinesCacheMs: number
}

const defaultCacheMs = 300_000
const defaultQuoteCacheMs = 30_000
const defaultKlinesCacheMs = 60_000

type MarketsConfigState = {
  config: MarketsConfig | null
  cache?: CachePort
}

function state(): MarketsConfigState {
  const g = globalThis as { __basilicMarketsConfig?: MarketsConfigState }
  g.__basilicMarketsConfig ??= { config: null }
  return g.__basilicMarketsConfig
}

export function configureMarkets({
  cache,
  coinGeckoDemoApiKey,
  coinsUseFixture = false,
  cacheMs = defaultCacheMs,
  quoteCacheMs = defaultQuoteCacheMs,
  klinesCacheMs = defaultKlinesCacheMs,
}: {
  cache?: CachePort
  coinGeckoDemoApiKey?: string
  coinsUseFixture?: boolean
  cacheMs?: number
  quoteCacheMs?: number
  klinesCacheMs?: number
} = {}): void {
  const next = state()
  next.config = {
    coinGeckoDemoApiKey,
    coinsUseFixture,
    cacheMs,
    quoteCacheMs,
    klinesCacheMs,
  }
  if (cache) next.cache = cache
}

export function getMarketsConfig(): MarketsConfig {
  const { config } = state()
  if (!config) throw new Error('configureMarkets() must be called before using markets')
  return config
}

export function takeConfiguredCache(): CachePort | undefined {
  return state().cache
}

export function resetMarketsConfig(): void {
  const next = state()
  next.config = null
  next.cache = undefined
}
