import {
  binanceQuoteMatchesVs,
  fetchBinanceKlines,
  fetchBinanceTicker,
  logBinanceSkip,
  tickerToQuote,
} from "./binance.js";
import { cacheKey, withVendorCache } from "./cache.js";
import {
  fetchCoinGeckoAsset,
  fetchCoinGeckoGlobal,
  fetchCoinGeckoMarkets,
  fetchCoinGeckoQuote,
  fetchCoinGeckoSearch,
  fetchCoinGeckoTrending,
} from "./coingecko.js";
import { getMarketsConfig } from "./config.js";
import {
  fixtureAsset,
  fixtureCandles,
  fixtureGlobal,
  fixtureMarkets,
  fixtureQuote,
  fixtureSearch,
  fixtureTrending,
} from "./fixture.js";
import { candlesProvider, quoteProvider } from "./policy.js";
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
} from "./types.js";

export async function searchAssets({
  text,
}: SearchAssetsArgs): Promise<SearchResult> {
  return withVendorCache({
    fallback: () => fixtureSearch({ text }),
    key: cacheKey("searchAssets", { text }),
    load: () => fetchCoinGeckoSearch({ text }),
    ttlMs: getMarketsConfig().cacheMs,
    vendor: "coingecko",
  });
}

export async function getMarkets({
  vs,
  topN,
  category,
  ids,
  sparkline,
}: GetMarketsArgs = {}): Promise<MarketsResult> {
  if (getMarketsConfig().coinsUseFixture) {
    return fixtureMarkets({ vs, topN, category, ids, sparkline });
  }
  return withVendorCache({
    fallback: () => fixtureMarkets({ vs, topN, category, ids, sparkline }),
    key: cacheKey("getMarkets", {
      vs: vs ?? "usd",
      topN,
      category,
      ids,
      sparkline,
    }),
    load: () => fetchCoinGeckoMarkets({ vs, topN, category, ids, sparkline }),
    ttlMs: getMarketsConfig().cacheMs,
    vendor: "coingecko",
  });
}

export async function getQuote({
  assetId,
  vs,
  mapping,
}: GetQuoteArgs): Promise<Quote> {
  const vsCurrency = vs ?? "usd";
  const binanceSymbol = mapping?.binanceSymbol;
  const useBinance =
    Boolean(binanceSymbol) && quoteProvider({ binanceSymbol }) === "binance";
  if (
    useBinance &&
    binanceSymbol &&
    binanceQuoteMatchesVs({ symbol: binanceSymbol, vs: vsCurrency })
  ) {
    const fromBinance = await withVendorCache({
      fallback: () => fixtureQuote({ assetId, vs: vsCurrency }),
      key: cacheKey("getQuote", {
        assetId,
        vs: vsCurrency,
        provider: "binance",
        binanceSymbol,
      }),
      load: async () =>
        tickerToQuote({
          assetId,
          vs: vsCurrency,
          ticker: await fetchBinanceTicker({ symbol: binanceSymbol }),
        }),
      ttlMs: getMarketsConfig().quoteCacheMs,
      vendor: "binance",
    });
    if (fromBinance.provider === "binance") {
      return fromBinance;
    }
    logBinanceSkip({ assetId, reason: "binance miss" });
  } else if (useBinance) {
    logBinanceSkip({ assetId, reason: "quote currency mismatch" });
  }

  return withVendorCache({
    fallback: () => fixtureQuote({ assetId, vs: vsCurrency }),
    key: cacheKey("getQuote", {
      assetId,
      vs: vsCurrency,
      provider: "coingecko",
      coingeckoId: mapping?.coingeckoId,
    }),
    load: () =>
      fetchCoinGeckoQuote({
        assetId,
        vs: vsCurrency,
        coingeckoId: mapping?.coingeckoId,
      }),
    ttlMs: getMarketsConfig().quoteCacheMs,
    vendor: "coingecko",
  });
}

export async function getCandles({
  assetId,
  interval,
  range,
  mapping,
}: GetCandlesArgs): Promise<CandlesResult> {
  const binanceSymbol = mapping?.binanceSymbol;
  const resolvedInterval = interval ?? "1h";
  if (candlesProvider({ binanceSymbol }) !== "binance" || !binanceSymbol) {
    return fixtureCandles({ assetId, interval: resolvedInterval });
  }

  return withVendorCache({
    fallback: () => fixtureCandles({ assetId, interval: resolvedInterval }),
    key: cacheKey("getCandles", {
      assetId,
      interval: resolvedInterval,
      range,
      binanceSymbol,
    }),
    load: async () => ({
      assetId,
      interval: resolvedInterval,
      candles: await fetchBinanceKlines({
        symbol: binanceSymbol,
        interval,
        range,
      }),
      source: "live" as const,
      provider: "binance" as const,
    }),
    ttlMs: getMarketsConfig().klinesCacheMs,
    vendor: "binance",
  });
}

export async function getTrending({
  vs,
}: GetTrendingArgs = {}): Promise<TrendingResult> {
  return withVendorCache({
    fallback: fixtureTrending,
    key: cacheKey("getTrending", { vs: vs ?? "usd" }),
    load: fetchCoinGeckoTrending,
    ttlMs: getMarketsConfig().cacheMs,
    vendor: "coingecko",
  });
}

export async function getAsset({
  assetId,
  mapping,
}: GetAssetArgs): Promise<AssetDetail> {
  return withVendorCache({
    fallback: () => fixtureAsset({ assetId }),
    key: cacheKey("getAsset", { assetId, coingeckoId: mapping?.coingeckoId }),
    load: () =>
      fetchCoinGeckoAsset({ assetId, coingeckoId: mapping?.coingeckoId }),
    ttlMs: getMarketsConfig().cacheMs,
    vendor: "coingecko",
  });
}

export async function getGlobal(): Promise<GlobalStats> {
  return withVendorCache({
    fallback: fixtureGlobal,
    key: cacheKey("getGlobal", {}),
    load: fetchCoinGeckoGlobal,
    ttlMs: getMarketsConfig().cacheMs,
    vendor: "coingecko",
  });
}
