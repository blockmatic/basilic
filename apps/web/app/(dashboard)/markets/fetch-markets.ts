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

export type { CoinMarket, MarketsSync }

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
