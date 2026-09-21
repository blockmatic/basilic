import type { SearchParams } from 'nuqs/server'
import { getUserInfo } from '@/lib/auth/auth-utils'
import { toCoinsQuery } from '@/lib/coins/search-query'
import {
  accountFromUser,
  composeSurface,
  overlayAccountQuery,
  splitBoardView,
  viewFromSearchQuery,
  viewTitle,
} from '@/lib/genui'
import { loadBoardView } from '@/lib/genui/surface.server'
import { fetchMarkets } from '../markets/fetch-markets'
import { CoinBoard } from './board'

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { query, surface } = splitBoardView({ view: await loadBoardView(searchParams) })
  const fetchQuery = overlayAccountQuery({ query, surface })
  const [markets, user] = await Promise.all([
    fetchMarkets({ query: toCoinsQuery({ query: fetchQuery }) }),
    getUserInfo(),
  ])
  const title = viewTitle({ surface, caption: markets.queryCaption })
  const spec = composeSurface({
    view: viewFromSearchQuery({ query: fetchQuery, title, surface }),
  })

  return (
    <CoinBoard
      spec={spec}
      initialQuery={query}
      initialSurface={surface}
      initialAccount={accountFromUser({ user })}
      initialCoins={markets.coins}
      initialSync={markets.sync}
      initialCaption={markets.queryCaption}
      initialError={markets.error}
      initialWatchedIds={markets.watchedIds}
    />
  )
}
