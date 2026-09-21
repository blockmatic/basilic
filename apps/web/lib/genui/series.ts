import type { CoinMarket } from '@/lib/coins/board'
import type { SearchQueryState } from '@/lib/coins/search-query'

export type SeriesCandle = {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  closeTime: number
}

export type SeriesState = {
  assetId: string
  interval: string
  candles: SeriesCandle[]
  source: string
  provider: string
}

export const emptySeriesState: SeriesState = {
  assetId: 'bitcoin',
  interval: '1h',
  candles: [],
  source: 'fixture',
  provider: 'fixture',
}

export function seriesAssetId({
  query,
  coins,
}: {
  query: SearchQueryState
  coins: CoinMarket[]
}): string {
  const token = query.symbols[0] ?? query.highlight[0]
  if (!token) return 'bitcoin'
  const match = coins.find(coin => coin.id === token || coin.symbol.toLowerCase() === token)
  return match?.id ?? (token === 'btc' ? 'bitcoin' : token)
}
