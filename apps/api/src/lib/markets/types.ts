export type Provenance = 'live' | 'fixture' | 'stale'
export type MarketProvider = 'coingecko' | 'binance' | 'fixture'
export type Vendor = 'coingecko' | 'binance'

export interface AssetMapping {
  coingeckoId?: string
  binanceSymbol?: string
}

export interface SearchAssetsArgs {
  text: string
}
export interface GetMarketsArgs {
  vs?: string
  topN?: number
  category?: string
  ids?: string[]
  sparkline?: boolean
}
export interface GetQuoteArgs {
  assetId: string
  vs?: string
  mapping?: AssetMapping
}
export interface GetCandlesArgs {
  assetId: string
  interval?: string
  range?: string
  mapping?: AssetMapping
}
export interface GetTrendingArgs {
  vs?: string
}
export interface GetAssetArgs {
  assetId: string
  mapping?: AssetMapping
}

export interface MarketRow {
  id: string
  symbol: string
  name: string
  imageUrl: string | null
  priceUsd: number
  change24h: number
  volumeUsd: number
  marketCapUsd: number
  rank: number
  fetchedAt: string
  source: Provenance
  provider: MarketProvider
}

export interface MarketsResult {
  markets: MarketRow[]
  source: Provenance
}

export interface Quote {
  assetId: string
  vs: string
  price: number
  change24h: number
  fetchedAt: string
  source: Provenance
  provider: MarketProvider
}

export interface Candle {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  closeTime: number
}

export interface CandlesResult {
  assetId: string
  interval: string
  candles: Candle[]
  source: Provenance
  provider: MarketProvider
}

export interface SearchHit {
  id: string
  symbol: string
  name: string
  rank: number | null
}
export interface SearchResult {
  hits: SearchHit[]
  source: Provenance
}

export interface TrendingCoin {
  id: string
  symbol: string
  name: string
  rank: number | null
  source: Provenance
}
export interface TrendingResult {
  coins: TrendingCoin[]
  source: Provenance
}

export interface AssetDetail {
  id: string
  symbol: string
  name: string
  description: string
  source: Provenance
  provider: MarketProvider
}

export interface GlobalStats {
  marketCapUsd: number
  volumeUsd: number
  btcDominance: number
  source: Provenance
}
