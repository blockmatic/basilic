'use client'

import { getErrorMessage } from '@repo/error'
import { useReactApiConfig } from '@repo/react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { boardNotices, type CoinMarket, type MarketsSync, mapListCoins } from '@/lib/coins/board'
import {
  isSameSearchQuery,
  type SearchQueryState,
  searchQueryParsers,
  toCoinsQuery,
} from '@/lib/coins/search-query'
import { coinsListQueryKey, coinsListQueryKeyPrefix, coinWatchesQueryKey } from '@/lib/query-keys'
import { MarketsTable } from '../../markets/markets-table'
import { BoardLayout } from './rail'

const watchCap = 20
const boardStaleMs = 30_000

type CoinBoardProps = {
  initialQuery: SearchQueryState
  initialCoins: CoinMarket[]
  initialSync: MarketsSync
  initialCaption: string
  initialError: string | null
  initialWatchedIds: string[]
}

export function CoinBoard({
  initialQuery,
  initialCoins,
  initialSync,
  initialCaption,
  initialError,
  initialWatchedIds,
}: CoinBoardProps) {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()
  const [query] = useQueryStates(searchQueryParsers, { history: 'push', shallow: true })
  const isInitial = isSameSearchQuery({ a: query, b: initialQuery })

  const listQuery = useQuery({
    queryKey: coinsListQueryKey(query),
    queryFn: async () =>
      mapListCoins({ data: await client.listCoins({ query: toCoinsQuery({ query }) }) }),
    initialData: isInitial
      ? { coins: initialCoins, sync: initialSync, queryCaption: initialCaption }
      : undefined,
    placeholderData: keepPreviousData,
    staleTime: boardStaleMs,
  })
  const watchesQuery = useQuery({
    queryKey: coinWatchesQueryKey,
    queryFn: async () => {
      const watches = await client.coins.watches.watches()
      return watches.map(watch => watch.assetId)
    },
    initialData: initialWatchedIds,
    staleTime: boardStaleMs,
  })
  const watchMutation = useMutation({
    mutationFn: async ({ assetId, nextWatched }: { assetId: string; nextWatched: boolean }) => {
      if (nextWatched) await client.coins.watches.assetId.watch({ path: { assetId } })
      else await client.coins.watches.assetId.id({ path: { assetId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinWatchesQueryKey })
      if (query.universe === 'watchlist')
        await queryClient.invalidateQueries({ queryKey: coinsListQueryKeyPrefix })
    },
    onError: error => {
      toast.error(getErrorMessage(error))
    },
  })

  const board = listQuery.data ?? {
    coins: initialCoins,
    sync: initialSync,
    queryCaption: initialCaption,
  }
  const coins = board.coins
  const sync = board.sync
  const caption = board.queryCaption
  const error = listQuery.error ? getErrorMessage(listQuery.error) : isInitial ? initialError : null
  const watchedIds = new Set(watchesQuery.data ?? [])
  const isAtCap = watchedIds.size >= watchCap
  const notices = error ? [] : boardNotices({ sync })
  const emptyWatchlist = query.universe === 'watchlist' && coins.length === 0 && !error

  function handleToggleWatch({ assetId, watched }: { assetId: string; watched: boolean }) {
    if (!watched && isAtCap) {
      toast.error('Watchlist is full')
      return
    }
    watchMutation.mutate({ assetId, nextWatched: !watched })
  }

  return (
    <div className="w-full" data-testid="coin-board">
      <BoardLayout>
        <div className="space-y-4">
          {caption ? (
            <h2 className="font-heading text-base font-semibold md:text-lg">{caption}</h2>
          ) : null}
          {notices.map(notice => (
            <p key={notice} className="text-muted-foreground text-sm">
              {notice}
            </p>
          ))}
          {emptyWatchlist ? (
            <p className="text-muted-foreground text-sm">nothing on your list</p>
          ) : (
            <MarketsTable
              coins={coins}
              error={error ?? undefined}
              watchedIds={watchedIds}
              isAtCap={isAtCap}
              pendingAssetId={
                watchMutation.isPending ? watchMutation.variables?.assetId : undefined
              }
              onToggleWatch={handleToggleWatch}
            />
          )}
        </div>
      </BoardLayout>
    </div>
  )
}
