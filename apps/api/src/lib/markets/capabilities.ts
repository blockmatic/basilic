import { env, marketsKlinesCacheMs, marketsQuoteCacheMs } from '../env.js'
import {
  binanceQuoteMatchesVs,
  fetchBinanceKlines,
  fetchBinanceTicker,
  logBinanceSkip,
  tickerToQuote,
} from './binance.js'
import { cacheKey, withVendorCache } from './cache.js'
import {
  fetchCoinGeckoAsset,
  fetchCoinGeckoGlobal,
  fetchCoinGeckoMarkets,
  fetchCoinGeckoQuote,
  fetchCoinGeckoSearch,
  fetchCoinGeckoTrending,
} from './coingecko.js'
import {
  fixtureAsset,
  fixtureCandles,
  fixtureGlobal,
  fixtureMarkets,
  fixtureQuote,
  fixtureSearch,
  fixtureTrending,
} from './fixture.js'
import { candlesProvider, quoteProvider } from './policy.js'
import type {
  AssetDetail,
  CandlesResult,
  GetAssetArgs,
  GetCandlesArgs,
  GetMarketsArgs,
  GetQuoteArgs,
  GetTrendingArgs,
  GlobalStats,
  MarketsResult,
  Quote,
  SearchAssetsArgs,
  SearchResult,
  TrendingResult,
} from './types.js'

export async function searchAssets({ text }: SearchAssetsArgs): Promise<SearchResult> {
  return withVendorCache({
    key: cacheKey('searchAssets', { text }),
    ttlMs: env.MARKETS_CACHE_MS,
    vendor: 'coingecko',
    load: () => fetchCoinGeckoSearch({ text }),
    fallback: () => fixtureSearch({ text }),
  })
}

export async function getMarkets({
  vs,
  topN,
  category,
  ids,
  sparkline,
}: GetMarketsArgs = {}): Promise<MarketsResult> {
  if (env.COINS_USE_FIXTURE) return fixtureMarkets({ vs, topN, category, ids, sparkline })
  return withVendorCache({
    key: cacheKey('getMarkets', { vs: vs ?? 'usd', topN, category, ids, sparkline }),
    ttlMs: env.MARKETS_CACHE_MS,
    vendor: 'coingecko',
    load: () => fetchCoinGeckoMarkets({ vs, topN, category, ids, sparkline }),
    fallback: () => fixtureMarkets({ vs, topN, category, ids, sparkline }),
  })
}

export async function getQuote({ assetId, vs, mapping }: GetQuoteArgs): Promise<Quote> {
  const vsCurrency = vs ?? 'usd'
  const binanceSymbol = mapping?.binanceSymbol
  const useBinance = Boolean(binanceSymbol) && quoteProvider({ binanceSymbol }) === 'binance'
  if (
    useBinance &&
    binanceSymbol &&
    binanceQuoteMatchesVs({ symbol: binanceSymbol, vs: vsCurrency })
  ) {
    const fromBinance = await withVendorCache({
      key: cacheKey('getQuote', { assetId, vs: vsCurrency, provider: 'binance', binanceSymbol }),
      ttlMs: marketsQuoteCacheMs,
      vendor: 'binance',
      load: async () =>
        tickerToQuote({
          assetId,
          vs: vsCurrency,
          ticker: await fetchBinanceTicker({ symbol: binanceSymbol }),
        }),
      fallback: () => fixtureQuote({ assetId, vs: vsCurrency }),
    })
    if (fromBinance.provider === 'binance') return fromBinance
    logBinanceSkip({ assetId, reason: 'binance miss' })
  } else if (useBinance) {
    logBinanceSkip({ assetId, reason: 'quote currency mismatch' })
  }

  return withVendorCache({
    key: cacheKey('getQuote', {
      assetId,
      vs: vsCurrency,
      provider: 'coingecko',
      coingeckoId: mapping?.coingeckoId,
    }),
    ttlMs: marketsQuoteCacheMs,
    vendor: 'coingecko',
    load: () => fetchCoinGeckoQuote({ assetId, vs: vsCurrency, coingeckoId: mapping?.coingeckoId }),
    fallback: () => fixtureQuote({ assetId, vs: vsCurrency }),
  })
}

export async function getCandles({
  assetId,
  interval,
  range,
  mapping,
}: GetCandlesArgs): Promise<CandlesResult> {
  const binanceSymbol = mapping?.binanceSymbol
  const resolvedInterval = interval ?? '1h'
  if (candlesProvider({ binanceSymbol }) !== 'binance' || !binanceSymbol)
    return fixtureCandles({ assetId, interval: resolvedInterval })

  return withVendorCache({
    key: cacheKey('getCandles', { assetId, interval: resolvedInterval, range, binanceSymbol }),
    ttlMs: marketsKlinesCacheMs,
    vendor: 'binance',
    load: async () => ({
      assetId,
      interval: resolvedInterval,
      candles: await fetchBinanceKlines({ symbol: binanceSymbol, interval, range }),
      source: 'live' as const,
      provider: 'binance' as const,
    }),
    fallback: () => fixtureCandles({ assetId, interval: resolvedInterval }),
  })
}

export async function getTrending({ vs }: GetTrendingArgs = {}): Promise<TrendingResult> {
  return withVendorCache({
    key: cacheKey('getTrending', { vs: vs ?? 'usd' }),
    ttlMs: env.MARKETS_CACHE_MS,
    vendor: 'coingecko',
    load: fetchCoinGeckoTrending,
    fallback: fixtureTrending,
  })
}

export async function getAsset({ assetId, mapping }: GetAssetArgs): Promise<AssetDetail> {
  return withVendorCache({
    key: cacheKey('getAsset', { assetId, coingeckoId: mapping?.coingeckoId }),
    ttlMs: env.MARKETS_CACHE_MS,
    vendor: 'coingecko',
    load: () => fetchCoinGeckoAsset({ assetId, coingeckoId: mapping?.coingeckoId }),
    fallback: () => fixtureAsset({ assetId }),
  })
}

export async function getGlobal(): Promise<GlobalStats> {
  return withVendorCache({
    key: cacheKey('getGlobal', {}),
    ttlMs: env.MARKETS_CACHE_MS,
    vendor: 'coingecko',
    load: fetchCoinGeckoGlobal,
    fallback: fixtureGlobal,
  })
}
