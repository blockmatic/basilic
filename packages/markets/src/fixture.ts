import type {
  AssetDetail,
  CandlesResult,
  GetMarketsArgs,
  GlobalStats,
  MarketRow,
  MarketsResult,
  Quote,
  SearchResult,
  TrendingResult,
} from "./types.js";

const fetchedAt = "2026-01-01T00:00:00.000Z";

function sparklineFromChange({ change7d }: { change7d: number }): number[] {
  const start = 100;
  const end = 100 * (1 + change7d / 100);
  return Array.from({ length: 8 }, (_, i) => start + ((end - start) * i) / 7);
}

function imageUrl({ path }: { path: string }) {
  return `https://assets.coingecko.com/coins/images/${path}`;
}

const catalog = [
  [
    "bitcoin",
    "btc",
    "Bitcoin",
    "1/large/bitcoin.png",
    67_420.12,
    2.14,
    3.2,
    28e9,
    1.32e12,
    1,
  ],
  [
    "ethereum",
    "eth",
    "Ethereum",
    "279/large/ethereum.png",
    3412.5,
    -1.08,
    -2.4,
    14e9,
    410e9,
    2,
  ],
  [
    "tether",
    "usdt",
    "Tether",
    "325/large/Tether.png",
    1,
    0.01,
    0.02,
    80e9,
    140e9,
    3,
  ],
  [
    "ripple",
    "xrp",
    "XRP",
    "44/large/xrp-symbol-white-128.png",
    0.62,
    0.41,
    1.1,
    1.1e9,
    35e9,
    4,
  ],
  [
    "binancecoin",
    "bnb",
    "BNB",
    "825/large/bnb-icon2_2x.png",
    580.2,
    1.2,
    2.8,
    1.8e9,
    84e9,
    5,
  ],
  [
    "solana",
    "sol",
    "Solana",
    "4128/large/solana.png",
    178.4,
    4.62,
    6.9,
    3.2e9,
    82e9,
    6,
  ],
  ["usd-coin", "usdc", "USDC", "6319/large/usdc.png", 1, 0, 0.01, 8e9, 40e9, 7],
  [
    "dogecoin",
    "doge",
    "Dogecoin",
    "5/large/dogecoin.png",
    0.12,
    6.11,
    8.4,
    1.5e9,
    17e9,
    8,
  ],
  [
    "cardano",
    "ada",
    "Cardano",
    "975/large/cardano.png",
    0.45,
    -2.3,
    -4.1,
    8e8,
    16e9,
    9,
  ],
  [
    "tron",
    "trx",
    "TRON",
    "1094/large/tron-logo.png",
    0.24,
    0.8,
    1.5,
    9e8,
    21e9,
    10,
  ],
  [
    "avalanche-2",
    "avax",
    "Avalanche",
    "12559/large/Avalanche_Circle_RedWhite_Trans.png",
    36.4,
    1.9,
    3.4,
    7e8,
    14e9,
    11,
  ],
  [
    "chainlink",
    "link",
    "Chainlink",
    "877/large/chainlink-new-logo.png",
    14.2,
    2.1,
    4.6,
    5e8,
    9e9,
    12,
  ],
  [
    "shiba-inu",
    "shib",
    "Shiba Inu",
    "11939/large/shiba.png",
    0.000018,
    3.4,
    5.2,
    4e8,
    10e9,
    13,
  ],
  [
    "polkadot",
    "dot",
    "Polkadot",
    "12171/large/polkadot.png",
    6.8,
    -0.6,
    -1.8,
    2.5e8,
    10e9,
    14,
  ],
  [
    "bitcoin-cash",
    "bch",
    "Bitcoin Cash",
    "780/large/bitcoin-cash-circle.png",
    430,
    1.4,
    2.2,
    3e8,
    8.5e9,
    15,
  ],
  [
    "sui",
    "sui",
    "Sui",
    "26375/large/sui-ocean-square.png",
    3.4,
    2.7,
    5.1,
    1e9,
    11e9,
    16,
  ],
  [
    "stellar",
    "xlm",
    "Stellar",
    "100/large/Stellar_symbol_black_RGB.png",
    0.28,
    0.9,
    1.7,
    1.8e8,
    8e9,
    17,
  ],
  [
    "uniswap",
    "uni",
    "Uniswap",
    "12504/large/uniswap-uni.png",
    9.1,
    -1.2,
    -2.9,
    2.2e8,
    6.8e9,
    18,
  ],
  [
    "litecoin",
    "ltc",
    "Litecoin",
    "2/large/litecoin.png",
    84.5,
    0.5,
    1.3,
    4e8,
    6.4e9,
    19,
  ],
  [
    "near",
    "near",
    "NEAR Protocol",
    "10365/large/near.jpg",
    5.2,
    1.6,
    2.4,
    3.5e8,
    6e9,
    20,
  ],
] as const;

export const fixtureQuotes = catalog.map(
  ([
    id,
    symbol,
    name,
    path,
    priceUsd,
    change24h,
    change7d,
    volumeUsd,
    marketCapUsd,
    rank,
  ]) => ({
    change24h,
    change7d,
    fetchedAt,
    id,
    imageUrl: imageUrl({ path }),
    marketCapUsd,
    name,
    priceUsd,
    rank,
    sparkline7d: sparklineFromChange({ change7d }),
    symbol,
    volumeUsd,
  })
);

export const fixtureSync = {
  fetchedAt: null,
  lastError: null,
  source: "fixture",
} as const;

function quoteById(assetId: string): (typeof fixtureQuotes)[number] {
  const match = fixtureQuotes.find((row) => row.id === assetId);
  if (!match) {
    throw new Error("fixture quote unavailable");
  }
  return match;
}

export function toFixtureMarketRow(
  quote: (typeof fixtureQuotes)[number]
): MarketRow {
  return {
    change24h: quote.change24h,
    change7d: quote.change7d,
    fetchedAt: quote.fetchedAt,
    id: quote.id,
    imageUrl: quote.imageUrl,
    marketCapUsd: quote.marketCapUsd,
    name: quote.name,
    priceUsd: quote.priceUsd,
    provider: "fixture",
    rank: quote.rank,
    source: "fixture",
    sparkline7d: [...quote.sparkline7d],
    symbol: quote.symbol,
    volumeUsd: quote.volumeUsd,
  };
}

export function fixtureMarkets({
  topN,
  category,
  ids,
}: GetMarketsArgs = {}): MarketsResult {
  if (category) {
    return { markets: [], source: "fixture" };
  }
  const selected = ids?.length
    ? fixtureQuotes.filter((row) => ids.includes(row.id))
    : fixtureQuotes;
  const limited = topN === undefined ? selected : selected.slice(0, topN);
  return { markets: limited.map(toFixtureMarketRow), source: "fixture" };
}

export function fixtureQuote({
  assetId,
  vs = "usd",
}: {
  assetId: string;
  vs?: string;
}): Quote {
  if (vs.toLowerCase() !== "usd") {
    throw new Error("fixture quote unavailable");
  }
  const quote = quoteById(assetId);
  return {
    assetId,
    change24h: quote.change24h,
    fetchedAt: quote.fetchedAt,
    price: quote.priceUsd,
    provider: "fixture",
    source: "fixture",
    vs,
  };
}

export function fixtureCandles({
  assetId,
  interval = "1h",
}: {
  assetId: string;
  interval?: string;
}): CandlesResult {
  return {
    assetId,
    candles: [],
    interval,
    provider: "fixture",
    source: "fixture",
  };
}

export function fixtureSearch({ text }: { text: string }): SearchResult {
  const needle = text.trim().toLowerCase();
  const hits = fixtureQuotes
    .filter(
      (row) =>
        row.id.includes(needle) ||
        row.symbol.includes(needle) ||
        row.name.toLowerCase().includes(needle)
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      rank: row.rank,
      symbol: row.symbol,
    }));
  return { hits, source: "fixture" };
}

export function fixtureTrending(): TrendingResult {
  return {
    coins: fixtureQuotes.slice(0, 3).map((row) => ({
      id: row.id,
      name: row.name,
      rank: row.rank,
      source: "fixture" as const,
      symbol: row.symbol,
    })),
    source: "fixture",
  };
}

export function fixtureAsset({ assetId }: { assetId: string }): AssetDetail {
  const quote = quoteById(assetId);
  return {
    description: "",
    id: assetId,
    name: quote.name,
    provider: "fixture",
    source: "fixture",
    symbol: quote.symbol,
  };
}

export function fixtureGlobal(): GlobalStats {
  return {
    btcDominance: 50,
    marketCapUsd: fixtureQuotes.reduce((sum, row) => sum + row.marketCapUsd, 0),
    source: "fixture",
    volumeUsd: fixtureQuotes.reduce((sum, row) => sum + row.volumeUsd, 0),
  };
}
