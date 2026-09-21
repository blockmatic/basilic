import type { ListCoinsData } from '@repo/core'
import { getErrorMessage } from '@repo/error'
import { getServerAuthToken } from '@/lib/auth/auth-server'
import { createBffClient } from '@/lib/auth/bff-client'
import {
  type CoinBoardData,
  type CoinMarket,
  emptySync,
  type MarketsSync,
  mapListCoins,
} from '@/lib/coins/board'
import {
  emptyGlobalState,
  emptyTrendingState,
  type GlobalState,
  type TrendingState,
} from '@/lib/genui'

export type { CoinMarket, MarketsSync }

export async function fetchOverview(): Promise<{
  global: GlobalState
  trending: TrendingState
}> {
  const { token } = await getServerAuthToken()
  if (!token) return { global: emptyGlobalState, trending: emptyTrendingState }
  const { client } = createBffClient({ token })
  const [globalResult, trendingResult] = await Promise.allSettled([
    client.coins.global(),
    client.coins.trending(),
  ])
  return {
    global: globalResult.status === 'fulfilled' ? globalResult.value : emptyGlobalState,
    trending: trendingResult.status === 'fulfilled' ? trendingResult.value : emptyTrendingState,
  }
}

export async function fetchMarkets({
  query,
}: {
  query?: NonNullable<ListCoinsData['query']>
} = {}): Promise<CoinBoardData & { watchedIds: string[]; error: string | null }> {
  const { token } = await getServerAuthToken()
  if (!token)
    return {
      coins: [],
      sync: emptySync,
      queryCaption: '',
      watchedIds: [],
      error: 'Authentication required',
    }

  const { client } = createBffClient({ token })
  const [coinsResult, watchesResult] = await Promise.allSettled([
    client.listCoins({ query }),
    client.coins.watches.watches(),
  ])
  const watchedIds =
    watchesResult.status === 'fulfilled' ? watchesResult.value.map(watch => watch.assetId) : []
  if (coinsResult.status === 'rejected')
    return {
      coins: [],
      sync: emptySync,
      queryCaption: '',
      watchedIds,
      error: getErrorMessage(coinsResult.reason),
    }

  return { ...mapListCoins({ data: coinsResult.value }), watchedIds, error: null }
}
