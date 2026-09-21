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
} from './types.js'

export const fixtureQuotes = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    priceUsd: 67_420.12,
    change24h: 2.14,
    volumeUsd: 28_000_000_000,
    marketCapUsd: 1_320_000_000_000,
    rank: 1,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    priceUsd: 3_412.5,
    change24h: -1.08,
    volumeUsd: 14_000_000_000,
    marketCapUsd: 410_000_000_000,
    rank: 2,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    imageUrl: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    priceUsd: 0.62,
    change24h: 0.41,
    volumeUsd: 1_100_000_000,
    marketCapUsd: 35_000_000_000,
    rank: 4,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    imageUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    priceUsd: 178.4,
    change24h: 4.62,
    volumeUsd: 3_200_000_000,
    marketCapUsd: 82_000_000_000,
    rank: 5,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    imageUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    priceUsd: 0.12,
    change24h: 6.11,
    volumeUsd: 1_500_000_000,
    marketCapUsd: 17_000_000_000,
    rank: 8,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    imageUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    priceUsd: 0.45,
    change24h: -2.3,
    volumeUsd: 800_000_000,
    marketCapUsd: 16_000_000_000,
    rank: 9,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  },
] as const

export const fixtureSync = { source: 'fixture', fetchedAt: null, lastError: null } as const

function quoteById(assetId: string): (typeof fixtureQuotes)[number] {
  const match = fixtureQuotes.find(row => row.id === assetId)
  if (!match) throw new Error('fixture quote unavailable')
  return match
}

export function toFixtureMarketRow(quote: (typeof fixtureQuotes)[number]): MarketRow {
  return {
    id: quote.id,
    symbol: quote.symbol,
    name: quote.name,
    imageUrl: quote.imageUrl,
    priceUsd: quote.priceUsd,
    change24h: quote.change24h,
    volumeUsd: quote.volumeUsd,
    marketCapUsd: quote.marketCapUsd,
    rank: quote.rank,
    fetchedAt: quote.fetchedAt,
    source: 'fixture',
    provider: 'fixture',
  }
}

export function fixtureMarkets({ topN, category, ids }: GetMarketsArgs = {}): MarketsResult {
  if (category) return { markets: [], source: 'fixture' }
  const selected = ids?.length ? fixtureQuotes.filter(row => ids.includes(row.id)) : fixtureQuotes
  const limited = topN === undefined ? selected : selected.slice(0, topN)
  return { markets: limited.map(toFixtureMarketRow), source: 'fixture' }
}

export function fixtureQuote({ assetId, vs = 'usd' }: { assetId: string; vs?: string }): Quote {
  if (vs.toLowerCase() !== 'usd') throw new Error('fixture quote unavailable')
  const quote = quoteById(assetId)
  return {
    assetId,
    vs,
    price: quote.priceUsd,
    change24h: quote.change24h,
    fetchedAt: quote.fetchedAt,
    source: 'fixture',
    provider: 'fixture',
  }
}

export function fixtureCandles({
  assetId,
  interval = '1h',
}: {
  assetId: string
  interval?: string
}): CandlesResult {
  return { assetId, interval, candles: [], source: 'fixture', provider: 'fixture' }
}

export function fixtureSearch({ text }: { text: string }): SearchResult {
  const needle = text.trim().toLowerCase()
  const hits = fixtureQuotes
    .filter(
      row =>
        row.id.includes(needle) ||
        row.symbol.includes(needle) ||
        row.name.toLowerCase().includes(needle),
    )
    .map(row => ({ id: row.id, symbol: row.symbol, name: row.name, rank: row.rank }))
  return { hits, source: 'fixture' }
}

export function fixtureTrending(): TrendingResult {
  return {
    coins: fixtureQuotes.slice(0, 3).map(row => ({
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      rank: row.rank,
      source: 'fixture' as const,
    })),
    source: 'fixture',
  }
}

export function fixtureAsset({ assetId }: { assetId: string }): AssetDetail {
  const quote = quoteById(assetId)
  return {
    id: assetId,
    symbol: quote.symbol,
    name: quote.name,
    description: '',
    source: 'fixture',
    provider: 'fixture',
  }
}

export function fixtureGlobal(): GlobalStats {
  return {
    marketCapUsd: fixtureQuotes.reduce((sum, row) => sum + row.marketCapUsd, 0),
    volumeUsd: fixtureQuotes.reduce((sum, row) => sum + row.volumeUsd, 0),
    btcDominance: 50,
    source: 'fixture',
  }
}
