export type Provenance = 'live' | 'fixture' | 'stale'
export type MarketProvider = 'coingecko' | 'binance' | 'fixture'
export type Vendor = 'coingecko' | 'binance'

export type AssetMapping = {
  coingeckoId?: string
  binanceSymbol?: string
}

export type SearchAssetsArgs = { text: string }
export type GetMarketsArgs = {
  vs?: string
  topN?: number
  category?: string
  ids?: string[]
  sparkline?: boolean
}
export type GetQuoteArgs = { assetId: string; vs?: string; mapping?: AssetMapping }
export type GetCandlesArgs = {
  assetId: string
  interval?: string
  range?: string
  mapping?: AssetMapping
}
export type GetTrendingArgs = { vs?: string }
export type GetAssetArgs = { assetId: string; mapping?: AssetMapping }

export type MarketRow = {
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

export type MarketsResult = { markets: MarketRow[]; source: Provenance }

export type Quote = {
  assetId: string
  vs: string
  price: number
  change24h: number
  fetchedAt: string
  source: Provenance
  provider: MarketProvider
}

export type Candle = {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  closeTime: number
}

export type CandlesResult = {
  assetId: string
  interval: string
  candles: Candle[]
  source: Provenance
  provider: MarketProvider
}

export type SearchHit = { id: string; symbol: string; name: string; rank: number | null }
export type SearchResult = { hits: SearchHit[]; source: Provenance }

export type TrendingCoin = {
  id: string
  symbol: string
  name: string
  rank: number | null
  source: Provenance
}
export type TrendingResult = { coins: TrendingCoin[]; source: Provenance }

export type AssetDetail = {
  id: string
  symbol: string
  name: string
  description: string
  source: Provenance
  provider: MarketProvider
}

export type GlobalStats = {
  marketCapUsd: number
  volumeUsd: number
  btcDominance: number
  source: Provenance
}
