import { listWatches } from '@repo/db'
import { env } from '../env.js'
import { listMarkets } from './read.js'
import { normalizeSearchQuery, type SearchQuery, type SearchQueryInput } from './search-query.js'
import type { CoinsDb } from './seed.js'
import { describeQuery, spokenSummary } from './spoken-summary.js'

const sortKeys = {
  rank: 'rank',
  change24h: 'change24h',
  volume: 'volumeUsd',
  marketCap: 'marketCapUsd',
  price: 'priceUsd',
} as const

type MarketCoin = Awaited<ReturnType<typeof listMarkets>>['coins'][number]

async function filterCoins({
  coins,
  query,
  userId,
}: {
  coins: MarketCoin[]
  query: SearchQuery
  userId: string
}): Promise<MarketCoin[]> {
  let rows = coins
  if (query.universe === 'watchlist') {
    const { watches } = await listWatches({ userId })
    const ids = new Set(watches.map(watch => watch.assetId))
    rows = rows.filter(coin => ids.has(coin.id))
  } else if (query.universe === 'majors') {
    const majors = new Set(env.COIN_MAJOR_SYMBOLS)
    rows = rows.filter(coin => majors.has(coin.symbol.toLowerCase()))
  }
  const { symbols, text, minChangePct, maxChangePct, minPrice, maxPrice } = query
  if (symbols) rows = rows.filter(coin => symbols.includes(coin.symbol.toLowerCase()))
  if (text) {
    const needle = text.toLowerCase()
    rows = rows.filter(
      coin =>
        coin.name.toLowerCase().includes(needle) || coin.symbol.toLowerCase().includes(needle),
    )
  }
  if (minChangePct != null) rows = rows.filter(coin => coin.change24h >= minChangePct)
  if (maxChangePct != null) rows = rows.filter(coin => coin.change24h <= maxChangePct)
  if (minPrice != null) rows = rows.filter(coin => coin.priceUsd >= minPrice)
  if (maxPrice != null) rows = rows.filter(coin => coin.priceUsd <= maxPrice)
  return rows
}

function sortCoins({ coins, query }: { coins: MarketCoin[]; query: SearchQuery }): MarketCoin[] {
  const key = sortKeys[query.sortBy]
  const dir = query.sortDir === 'desc' ? -1 : 1
  return [...coins].sort((a, b) => {
    const delta = (a[key] - b[key]) * dir
    if (delta !== 0) return delta
    return a.rank - b.rank || a.id.localeCompare(b.id)
  })
}

export async function queryCoins({
  db,
  userId,
  query,
}: {
  db: CoinsDb
  userId: string
  query: SearchQueryInput
}) {
  const effective = normalizeSearchQuery({ query })
  const { coins, sync } = await listMarkets({ db })
  const filtered = await filterCoins({ coins, query: effective, userId })
  const sorted = sortCoins({ coins: filtered, query: effective })
  const sliced = effective.topN != null ? sorted.slice(0, effective.topN) : sorted
  const highlight = new Set(effective.highlight ?? [])
  const marked = sliced.map(coin => ({
    ...coin,
    highlighted: highlight.has(coin.symbol.toLowerCase()),
  }))
  return {
    coins: marked,
    sync,
    query: effective,
    spokenSummary: spokenSummary({ coins: marked, query: effective, sync }),
    queryCaption: describeQuery({ query: effective }),
  }
}
