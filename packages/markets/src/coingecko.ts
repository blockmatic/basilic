import { Coingecko } from "@coingecko/coingecko-typescript";

import { getMarketsConfig } from "./config.js";
import { fetchAllowed, fetchTimeoutMs } from "./policy.js";
import type {
  AssetDetail,
  GetMarketsArgs,
  GlobalStats,
  MarketRow,
  MarketsResult,
  Quote,
  SearchResult,
  TrendingResult,
} from "./types.js";

let client: Coingecko | undefined;

function getClient(): Coingecko {
  client ??= new Coingecko({
    baseURL: null,
    defaultHeaders: { "x-cg-pro-api-key": null },
    demoAPIKey: getMarketsConfig().coinGeckoDemoApiKey ?? null,
    environment: "demo",
    fetch: fetchAllowed,
    logLevel: "off",
    maxRetries: 0,
    proAPIKey: null,
    timeout: fetchTimeoutMs,
  });
  return client;
}

export function resetCoinGeckoClient(): void {
  client = undefined;
}

export function geckoId({
  assetId,
  coingeckoId,
}: {
  assetId: string;
  coingeckoId?: string;
}): string {
  return coingeckoId ?? assetId;
}

export async function fetchCoinGeckoMarkets({
  vs,
  topN,
  category,
  ids,
  sparkline,
}: GetMarketsArgs): Promise<MarketsResult> {
  const vsCurrency = vs ?? "usd";
  const query: {
    vs_currency: string;
    category?: string;
    ids?: string;
    per_page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
  } = { vs_currency: vsCurrency };
  if (category) {
    query.category = category;
  }
  if (ids?.length) {
    query.ids = ids.join(",");
  }
  if (topN !== undefined) {
    query.per_page = topN;
  }
  if (sparkline !== undefined) {
    query.sparkline = sparkline;
  }
  if (sparkline) {
    query.price_change_percentage = "7d";
  }
  const rows = await getClient().coins.markets.get(query);
  return {
    markets: rows.flatMap((row) => toMarketRow({ row, vs: vsCurrency })),
    source: "live",
  };
}

function toMarketRow({
  row,
  vs,
}: {
  row: {
    id: string;
    symbol: string;
    name: string;
    image?: string;
    current_price?: number | null;
    price_change_percentage_24h?: number | null;
    price_change_percentage_7d_in_currency?: number | null;
    sparkline_in_7d?: { price?: number[] };
    total_volume?: number | null;
    market_cap?: number | null;
    market_cap_rank?: number | null;
    last_updated?: string;
  };
  vs: string;
}): MarketRow[] {
  if (vs.toLowerCase() !== "usd") {
    return [];
  }
  const priceUsd = row.current_price;
  if (typeof priceUsd !== "number" || !Number.isFinite(priceUsd)) {
    return [];
  }
  const change7d = row.price_change_percentage_7d_in_currency;
  return [
    {
      change24h: row.price_change_percentage_24h ?? 0,
      change7d:
        typeof change7d === "number" && Number.isFinite(change7d)
          ? change7d
          : null,
      fetchedAt: row.last_updated ?? new Date().toISOString(),
      id: row.id,
      imageUrl: row.image ?? null,
      marketCapUsd: row.market_cap ?? 0,
      name: row.name,
      priceUsd,
      provider: "coingecko",
      rank: row.market_cap_rank ?? 0,
      source: "live",
      sparkline7d: sparklinePrices({ prices: row.sparkline_in_7d?.price }),
      symbol: row.symbol,
      volumeUsd: row.total_volume ?? 0,
    },
  ];
}

function sparklinePrices({ prices }: { prices?: number[] }): number[] {
  if (!Array.isArray(prices)) {
    return [];
  }
  return prices.filter(
    (value) => typeof value === "number" && Number.isFinite(value)
  );
}

export async function fetchCoinGeckoQuote({
  assetId,
  vs = "usd",
  coingeckoId,
}: {
  assetId: string;
  vs?: string;
  coingeckoId?: string;
}): Promise<Quote> {
  const id = geckoId({ assetId, coingeckoId });
  const payload = await getClient().simple.price.get({
    ids: id,
    include_24hr_change: true,
    include_last_updated_at: true,
    vs_currencies: vs,
  });
  const row = payload[id] as Record<string, number | undefined> | undefined;
  const price = row?.[vs];
  if (typeof price !== "number" || !Number.isFinite(price)) {
    throw new Error("coingecko quote missing");
  }
  const change = row?.[`${vs}_24h_change`];
  const updated = row?.last_updated_at;
  return {
    assetId,
    change24h: typeof change === "number" ? change : 0,
    fetchedAt:
      typeof updated === "number"
        ? new Date(updated * 1000).toISOString()
        : new Date().toISOString(),
    price,
    provider: "coingecko",
    source: "live",
    vs,
  };
}

export async function fetchCoinGeckoSearch({
  text,
}: {
  text: string;
}): Promise<SearchResult> {
  const payload = await getClient().search.get({ query: text });
  return {
    hits: payload.coins.map((coin) => ({
      id: coin.id,
      name: coin.name,
      rank: coin.market_cap_rank,
      symbol: coin.symbol,
    })),
    source: "live",
  };
}

export async function fetchCoinGeckoTrending(): Promise<TrendingResult> {
  const payload = await getClient().search.trending.get();
  return {
    coins: payload.coins.map((entry) => ({
      id: entry.item.id,
      name: entry.item.name,
      rank: entry.item.market_cap_rank,
      source: "live" as const,
      symbol: entry.item.symbol,
    })),
    source: "live",
  };
}

export async function fetchCoinGeckoAsset({
  assetId,
  coingeckoId,
}: {
  assetId: string;
  coingeckoId?: string;
}): Promise<AssetDetail> {
  const id = geckoId({ assetId, coingeckoId });
  const payload = await getClient().coins.getID(id, {
    localization: false,
    sparkline: false,
    tickers: false,
  });
  return {
    description: stripHtml(payload.description?.en ?? ""),
    id: payload.id,
    name: payload.name,
    provider: "coingecko",
    source: "live",
    symbol: payload.symbol,
  };
}

export async function fetchCoinGeckoGlobal(): Promise<GlobalStats> {
  const payload = await getClient().global.get();
  return {
    btcDominance: payload.data.market_cap_percentage.btc ?? 0,
    marketCapUsd: payload.data.total_market_cap.usd ?? 0,
    source: "live",
    volumeUsd: payload.data.total_volume.usd ?? 0,
  };
}

function stripHtml(html: string): string {
  return html
    .replaceAll(/<[^>]*>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}
