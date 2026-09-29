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

function sparklineFromChange({ change7d }: { change7d: number }): number[] {
  const start = 100
  const end = 100 * (1 + change7d / 100)
  return Array.from({ length: 8 }, (_, i) => start + ((end - start) * i) / 7)
}

function quote({
  change7d,
  ...row
}: {
  id: string
  symbol: string
  name: string
  imageUrl: string
  priceUsd: number
  change24h: number
  change7d: number
  volumeUsd: number
  marketCapUsd: number
  rank: number
  fetchedAt: string
}) {
  return { ...row, change7d, sparkline7d: sparklineFromChange({ change7d }) }
}

export const fixtureQuotes = [
  quote({
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    priceUsd: 67_420.12,
    change24h: 2.14,
    change7d: 3.2,
    volumeUsd: 28_000_000_000,
    marketCapUsd: 1_320_000_000_000,
    rank: 1,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    priceUsd: 3_412.5,
    change24h: -1.08,
    change7d: -2.4,
    volumeUsd: 14_000_000_000,
    marketCapUsd: 410_000_000_000,
    rank: 2,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    imageUrl: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    priceUsd: 1,
    change24h: 0.01,
    change7d: 0.02,
    volumeUsd: 80_000_000_000,
    marketCapUsd: 140_000_000_000,
    rank: 3,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    imageUrl: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    priceUsd: 0.62,
    change24h: 0.41,
    change7d: 1.1,
    volumeUsd: 1_100_000_000,
    marketCapUsd: 35_000_000_000,
    rank: 4,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    imageUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    priceUsd: 580.2,
    change24h: 1.2,
    change7d: 2.8,
    volumeUsd: 1_800_000_000,
    marketCapUsd: 84_000_000_000,
    rank: 5,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    imageUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    priceUsd: 178.4,
    change24h: 4.62,
    change7d: 6.9,
    volumeUsd: 3_200_000_000,
    marketCapUsd: 82_000_000_000,
    rank: 6,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'usd-coin',
    symbol: 'usdc',
    name: 'USDC',
    imageUrl: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png',
    priceUsd: 1,
    change24h: 0,
    change7d: 0.01,
    volumeUsd: 8_000_000_000,
    marketCapUsd: 40_000_000_000,
    rank: 7,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    imageUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    priceUsd: 0.12,
    change24h: 6.11,
    change7d: 8.4,
    volumeUsd: 1_500_000_000,
    marketCapUsd: 17_000_000_000,
    rank: 8,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    imageUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    priceUsd: 0.45,
    change24h: -2.3,
    change7d: -4.1,
    volumeUsd: 800_000_000,
    marketCapUsd: 16_000_000_000,
    rank: 9,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'tron',
    symbol: 'trx',
    name: 'TRON',
    imageUrl: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
    priceUsd: 0.24,
    change24h: 0.8,
    change7d: 1.5,
    volumeUsd: 900_000_000,
    marketCapUsd: 21_000_000_000,
    rank: 10,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'avalanche-2',
    symbol: 'avax',
    name: 'Avalanche',
    imageUrl:
      'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    priceUsd: 36.4,
    change24h: 1.9,
    change7d: 3.4,
    volumeUsd: 700_000_000,
    marketCapUsd: 14_000_000_000,
    rank: 11,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'chainlink',
    symbol: 'link',
    name: 'Chainlink',
    imageUrl: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    priceUsd: 14.2,
    change24h: 2.1,
    change7d: 4.6,
    volumeUsd: 500_000_000,
    marketCapUsd: 9_000_000_000,
    rank: 12,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'shiba-inu',
    symbol: 'shib',
    name: 'Shiba Inu',
    imageUrl: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    priceUsd: 0.000018,
    change24h: 3.4,
    change7d: 5.2,
    volumeUsd: 400_000_000,
    marketCapUsd: 10_000_000_000,
    rank: 13,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'polkadot',
    symbol: 'dot',
    name: 'Polkadot',
    imageUrl: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    priceUsd: 6.8,
    change24h: -0.6,
    change7d: -1.8,
    volumeUsd: 250_000_000,
    marketCapUsd: 10_000_000_000,
    rank: 14,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'bitcoin-cash',
    symbol: 'bch',
    name: 'Bitcoin Cash',
    imageUrl: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
    priceUsd: 430,
    change24h: 1.4,
    change7d: 2.2,
    volumeUsd: 300_000_000,
    marketCapUsd: 8_500_000_000,
    rank: 15,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'sui',
    symbol: 'sui',
    name: 'Sui',
    imageUrl: 'https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png',
    priceUsd: 3.4,
    change24h: 2.7,
    change7d: 5.1,
    volumeUsd: 1_000_000_000,
    marketCapUsd: 11_000_000_000,
    rank: 16,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'stellar',
    symbol: 'xlm',
    name: 'Stellar',
    imageUrl: 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
    priceUsd: 0.28,
    change24h: 0.9,
    change7d: 1.7,
    volumeUsd: 180_000_000,
    marketCapUsd: 8_000_000_000,
    rank: 17,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'uniswap',
    symbol: 'uni',
    name: 'Uniswap',
    imageUrl: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    priceUsd: 9.1,
    change24h: -1.2,
    change7d: -2.9,
    volumeUsd: 220_000_000,
    marketCapUsd: 6_800_000_000,
    rank: 18,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'litecoin',
    symbol: 'ltc',
    name: 'Litecoin',
    imageUrl: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    priceUsd: 84.5,
    change24h: 0.5,
    change7d: 1.3,
    volumeUsd: 400_000_000,
    marketCapUsd: 6_400_000_000,
    rank: 19,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
  quote({
    id: 'near',
    symbol: 'near',
    name: 'NEAR Protocol',
    imageUrl: 'https://assets.coingecko.com/coins/images/10365/large/near.jpg',
    priceUsd: 5.2,
    change24h: 1.6,
    change7d: 2.4,
    volumeUsd: 350_000_000,
    marketCapUsd: 6_000_000_000,
    rank: 20,
    fetchedAt: '2026-01-01T00:00:00.000Z',
  }),
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
    change7d: quote.change7d,
    sparkline7d: [...quote.sparkline7d],
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
