import type { SearchParams } from 'nuqs/server'
import { getUserInfo } from '@/lib/auth/auth-utils'
import { loadChrome } from '@/lib/coins/chrome.server'
import { toCoinsQuery } from '@/lib/coins/search-query'
import {
  accountFromUser,
  composeSurface,
  overlayAccountQuery,
  specFromSelection,
  splitBoardView,
  viewFromSearchQuery,
  viewTitle,
} from '@/lib/genui'
import { loadBoardView } from '@/lib/genui/surface.server'
import { fetchMarkets } from '../markets/fetch-markets'
import { CoinBoard } from './board'

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [view, chrome] = await Promise.all([loadBoardView(searchParams), loadChrome(searchParams)])
  const { query, surface, period, columns, elements } = splitBoardView({ view })
  const fetchQuery = overlayAccountQuery({ query, surface })
  const [markets, user] = await Promise.all([
    fetchMarkets({ query: toCoinsQuery({ query: fetchQuery }) }),
    getUserInfo(),
  ])
  const title = viewTitle({ surface, caption: markets.queryCaption })
  const viewConfig = viewFromSearchQuery({
    query: fetchQuery,
    title,
    surface,
    period,
    columns,
    elements,
  })
  const spec = elements.length
    ? specFromSelection({ elements, view: viewConfig })
    : composeSurface({ view: viewConfig })

  return (
    <CoinBoard
      spec={spec}
      initialQuery={query}
      initialSurface={surface}
      initialPeriod={period}
      initialColumns={columns}
      initialElements={elements}
      initialChrome={chrome}
      initialAccount={accountFromUser({ user })}
      initialCoins={markets.coins}
      initialSync={markets.sync}
      initialCaption={markets.queryCaption}
      initialError={markets.error}
      initialWatchedIds={markets.watchedIds}
    />
  )
}
