'use client'

import type { Spec } from '@json-render/core'
import {
  ActionProvider,
  createStateStore,
  Renderer,
  StateProvider,
  VisibilityProvider,
} from '@json-render/react'
import { getErrorMessage } from '@repo/error'
import { useReactApiConfig } from '@repo/react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useQueryStates } from 'nuqs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BoardWatchProvider, boardRegistry } from '@/components/genui'
import { boardNotices, type CoinMarket, type MarketsSync, mapListCoins } from '@/lib/coins/board'
import type { ChromeState } from '@/lib/coins/chrome'
import {
  clearedSearchQuery,
  isSameSearchQuery,
  type SearchQueryState,
  toCoinsQuery,
} from '@/lib/coins/search-query'
import {
  type AccountState,
  boardViewParsers,
  composeSurface,
  overlayAccountQuery,
  specFromSelection,
  splitBoardView,
  type ViewPeriod,
  type ViewSurface,
  viewFromSearchQuery,
  viewTitle,
} from '@/lib/genui'
import {
  accountWalletQueryKey,
  coinsListQueryKey,
  coinsListQueryKeyPrefix,
  coinWatchesQueryKey,
} from '@/lib/query-keys'
import { emptyWalletState } from '@/lib/wallet'
import { BoardLayout } from './rail'

const watchCap = 20
const boardStaleMs = 30_000

type CoinBoardProps = {
  spec: Spec
  initialQuery: SearchQueryState
  initialSurface: ViewSurface
  initialPeriod: ViewPeriod | null
  initialColumns: string[]
  initialElements: string[]
  initialChrome: ChromeState
  initialAccount: AccountState
  initialCoins: CoinMarket[]
  initialSync: MarketsSync
  initialCaption: string
  initialError: string | null
  initialWatchedIds: string[]
}

export function CoinBoard({
  spec,
  initialQuery,
  initialSurface,
  initialPeriod,
  initialColumns,
  initialElements,
  initialChrome,
  initialAccount,
  initialCoins,
  initialSync,
  initialCaption,
  initialError,
  initialWatchedIds,
}: CoinBoardProps) {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()
  const [view, setView] = useQueryStates(boardViewParsers, { history: 'push', shallow: true })
  const { query, surface, period, columns, elements } = splitBoardView({ view })
  const fetchQuery = overlayAccountQuery({ query, surface })
  const isInitial =
    surface === initialSurface &&
    period === initialPeriod &&
    columns.length === initialColumns.length &&
    columns.every((id, index) => id === initialColumns[index]) &&
    elements.length === initialElements.length &&
    elements.every((id, index) => id === initialElements[index]) &&
    isSameSearchQuery({ a: query, b: initialQuery })
  const [store] = useState(() =>
    createStateStore({
      coins: initialCoins,
      sync: initialSync,
      caption: initialCaption,
      error: initialError,
      account: initialAccount,
      wallet: emptyWalletState,
    }),
  )

  const listQuery = useQuery({
    queryKey: coinsListQueryKey(fetchQuery),
    queryFn: async () =>
      mapListCoins({
        data: await client.listCoins({ query: toCoinsQuery({ query: fetchQuery }) }),
      }),
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
  const walletQuery = useQuery({
    queryKey: accountWalletQueryKey,
    queryFn: () => client.account.wallet(),
    staleTime: boardStaleMs,
  })
  const watchMutation = useMutation({
    mutationFn: async ({ assetId, nextWatched }: { assetId: string; nextWatched: boolean }) => {
      if (nextWatched) await client.coins.watches.assetId.watch({ path: { assetId } })
      else await client.coins.watches.assetId.id({ path: { assetId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinWatchesQueryKey })
      if (fetchQuery.universe === 'watchlist')
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
  const emptyWatchlist = fetchQuery.universe === 'watchlist' && coins.length === 0 && !error
  const liveView = viewFromSearchQuery({
    query: fetchQuery,
    title: viewTitle({ surface, caption }),
    surface,
    period,
    columns,
    elements,
  })
  const liveSpec = isInitial
    ? spec
    : elements.length
      ? specFromSelection({ elements, view: liveView })
      : composeSurface({ view: liveView })

  useEffect(() => {
    store.update({
      '/coins': coins,
      '/sync': sync,
      '/caption': caption,
      '/error': error,
      '/account': initialAccount,
      '/wallet': walletQuery.data ?? emptyWalletState,
    })
  }, [store, coins, sync, caption, error, initialAccount, walletQuery.data])

  function handleToggleWatch({ assetId, watched }: { assetId: string; watched: boolean }) {
    if (!watched && isAtCap) {
      toast.error('Watchlist is full')
      return
    }
    watchMutation.mutate({ assetId, nextWatched: !watched })
  }

  async function handleResetView() {
    await setView({
      ...clearedSearchQuery,
      surface: null,
      period: null,
      columns: null,
      elements: null,
    })
  }

  return (
    <div className="w-full" data-testid="coin-board" data-spec-root={liveSpec.root}>
      <BoardLayout initialChrome={initialChrome}>
        <div className="space-y-4">
          {notices.map(notice => (
            <p key={notice} className="text-muted-foreground text-sm">
              {notice}
            </p>
          ))}
          {emptyWatchlist ? (
            <p className="text-muted-foreground text-sm">nothing on your list</p>
          ) : null}
          <StateProvider store={store}>
            <VisibilityProvider>
              <ActionProvider handlers={{ reset_view: handleResetView }}>
                <BoardWatchProvider
                  value={{
                    watchedIds,
                    isAtCap,
                    pendingAssetId: watchMutation.isPending
                      ? watchMutation.variables?.assetId
                      : undefined,
                    onToggleWatch: handleToggleWatch,
                  }}
                >
                  <Renderer spec={liveSpec} registry={boardRegistry} />
                </BoardWatchProvider>
              </ActionProvider>
            </VisibilityProvider>
          </StateProvider>
        </div>
      </BoardLayout>
    </div>
  )
}
