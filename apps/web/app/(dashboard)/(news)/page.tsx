import type { SearchParams } from 'nuqs/server'
import { toCoinsQuery } from '@/lib/coins/search-query'
import { loadSearchQuery } from '@/lib/coins/search-query.server'
import { fetchMarkets } from '../markets/fetch-markets'
import { CoinBoard } from './coin-board'

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await loadSearchQuery(searchParams)
  const markets = await fetchMarkets({ query: toCoinsQuery({ query }) })

  return (
    <CoinBoard
      initialQuery={query}
      initialCoins={markets.coins}
      initialSync={markets.sync}
      initialCaption={markets.queryCaption}
      initialError={markets.error}
      initialWatchedIds={markets.watchedIds}
    />
  )
}
