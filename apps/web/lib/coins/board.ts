import type { ListCoinsResponse } from '@repo/core'

export type CoinMarket = {
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
}

export type MarketsSync = {
  source: string
  fetchedAt: string | null
  lastError: string | null
  stale?: boolean
  attribution?: string | null
}

export type CoinBoardData = {
  coins: CoinMarket[]
  sync: MarketsSync
  queryCaption: string
}

export const emptySync: MarketsSync = { source: 'fixture', fetchedAt: null, lastError: null }

function asNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

export function mapListCoins({ data }: { data: ListCoinsResponse }): CoinBoardData {
  return {
    coins: data.coins.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      imageUrl: asNullableString(coin.imageUrl),
      priceUsd: coin.priceUsd,
      change24h: coin.change24h,
      volumeUsd: coin.volumeUsd,
      marketCapUsd: coin.marketCapUsd,
      rank: coin.rank,
      fetchedAt: coin.fetchedAt,
    })),
    sync: {
      source: data.sync.source,
      fetchedAt: asNullableString(data.sync.fetchedAt),
      lastError: asNullableString(data.sync.lastError),
      stale: data.sync.stale,
      attribution: asNullableString(data.sync.attribution),
    },
    queryCaption: data.queryCaption,
  }
}

export function isSampleBoard({ source, fetchedAt }: MarketsSync): boolean {
  return source === 'fixture' || fetchedAt == null
}

export function formatUpdatedAt({
  fetchedAt,
  now = Date.now(),
}: {
  fetchedAt: string
  now?: number
}): string | null {
  const then = new Date(fetchedAt).getTime()
  if (Number.isNaN(then)) return null
  const minutes = Math.max(0, Math.round((now - then) / 60_000))
  return `Updated ${minutes} min ago`
}

export function boardNotices({ sync, now }: { sync: MarketsSync; now?: number }): string[] {
  if (isSampleBoard(sync) || sync.source === 'fixture') return ['Showing a sample board.']
  const notices: string[] = []
  if (sync.source === 'stale' || sync.stale) notices.push('Prices may be stale.')
  if (sync.source === 'live') notices.push(sync.attribution || 'Data by CoinGecko')
  if (sync.fetchedAt) {
    const updated = formatUpdatedAt({ fetchedAt: sync.fetchedAt, now })
    if (updated) notices.push(updated)
  }
  return notices
}
