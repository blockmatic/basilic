import type { SearchParams } from 'nuqs/server'
import { toCoinsQuery } from '@/lib/coins/search-query'
import { loadSearchQuery } from '@/lib/coins/search-query.server'
import { composeSurface, viewFromSearchQuery } from '@/lib/genui'
import { fetchMarkets } from '../markets/fetch-markets'
import { CoinBoard } from './board'

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await loadSearchQuery(searchParams)
  const markets = await fetchMarkets({ query: toCoinsQuery({ query }) })
  const spec = composeSurface({
    view: viewFromSearchQuery({ query, title: markets.queryCaption }),
  })

  return (
    <CoinBoard
      spec={spec}
      initialQuery={query}
      initialCoins={markets.coins}
      initialSync={markets.sync}
      initialCaption={markets.queryCaption}
      initialError={markets.error}
      initialWatchedIds={markets.watchedIds}
    />
  )
}
