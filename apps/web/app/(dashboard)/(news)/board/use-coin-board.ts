'use client'

import { createStateStore } from '@json-render/react'
import { getErrorMessage } from '@repo/error'
import { useReactApiConfig, useUser } from '@repo/react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useQueryStates } from 'nuqs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { boardNotices, mapListCoins } from '@/lib/coins/board'
import { clearedSearchQuery, toCoinsQuery } from '@/lib/coins/search-query'
import {
  boardViewParsers,
  composeSurface,
  defaultCandlePeriod,
  emptyGlobalState,
  emptySeriesState,
  emptyTrendingState,
  overlayAccountQuery,
  seriesAssetId,
  specFromSelection,
  splitBoardView,
  viewFromSearchQuery,
  viewTitle,
} from '@/lib/genui'
import {
  accountWalletQueryKey,
  coinsCandlesQueryKey,
  coinsGlobalQueryKey,
  coinsListQueryKey,
  coinsListQueryKeyPrefix,
  coinsTrendingQueryKey,
  coinWatchesQueryKey,
} from '@/lib/query-keys'
import { emptyWalletState } from '@/lib/wallet'
import { useAccountRequiredPrompt } from './account-required'
import { type CoinBoardProps, isInitialBoardView } from './coin-board'

const watchCap = 20
const boardStaleMs = 30_000

export function useCoinBoard({
  spec,
  initialQuery,
  initialSurface,
  initialPeriod,
  initialChart,
  initialFocus,
  initialColumns,
  initialElements,
  initialAccount,
  initialCoins,
  initialSync,
  initialCaption,
  initialError,
  initialWatchedIds,
  initialGlobal,
  initialTrending,
}: CoinBoardProps) {
  const { client } = useReactApiConfig()
  const { data: session, isLoading: isSessionLoading } = useUser()
  const signedIn = Boolean(session?.user)
  const { prompted, setPrompted } = useAccountRequiredPrompt()
  const queryClient = useQueryClient()
  const [view, setView] = useQueryStates(boardViewParsers, { history: 'push', shallow: true })
  const { query, surface, period, chart, focus, columns, elements } = splitBoardView({ view })
  const fetchQuery = overlayAccountQuery({ query, surface })
  const needsAccount = surface === 'account' || fetchQuery.universe === 'watchlist' || prompted
  const showAuthRequired = !isSessionLoading && !signedIn && needsAccount
  const isInitial = isInitialBoardView({
    query,
    surface,
    period,
    chart,
    focus,
    columns,
    elements,
    initialQuery,
    initialSurface,
    initialPeriod,
    initialChart,
    initialFocus,
    initialColumns,
    initialElements,
  })
  const [store] = useState(() =>
    createStateStore({
      coins: initialCoins,
      sync: initialSync,
      caption: initialCaption,
      error: initialError,
      account: initialAccount,
      wallet: emptyWalletState,
      series: emptySeriesState,
      global: initialGlobal,
      trending: initialTrending,
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
    enabled: !showAuthRequired,
  })
  const watchesQuery = useQuery({
    queryKey: coinWatchesQueryKey,
    queryFn: async () => {
      const watches = await client.coins.watches.watches()
      return watches.map(watch => watch.assetId)
    },
    initialData: initialWatchedIds,
    staleTime: boardStaleMs,
    enabled: signedIn,
  })
  const walletQuery = useQuery({
    queryKey: accountWalletQueryKey,
    queryFn: () => client.account.wallet(),
    staleTime: boardStaleMs,
    enabled: signedIn,
  })
  const seriesAsset = seriesAssetId({
    query: fetchQuery,
    coins: listQuery.data?.coins ?? initialCoins,
    focus,
  })
  const candlePeriod = period ?? defaultCandlePeriod
  const seriesQuery = useQuery({
    queryKey: coinsCandlesQueryKey({ assetId: seriesAsset, period: candlePeriod }),
    queryFn: () =>
      client.coins.assetId.candles({
        path: { assetId: seriesAsset },
        query: { period: candlePeriod },
      }),
    staleTime: boardStaleMs,
    enabled: !showAuthRequired,
  })
  const globalQuery = useQuery({
    queryKey: coinsGlobalQueryKey,
    queryFn: () => client.coins.global(),
    initialData: isInitial ? initialGlobal : undefined,
    staleTime: boardStaleMs,
  })
  const trendingQuery = useQuery({
    queryKey: coinsTrendingQueryKey,
    queryFn: () => client.coins.trending(),
    initialData: isInitial ? initialTrending : undefined,
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
    chart,
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
      '/series': seriesQuery.data ?? emptySeriesState,
      '/global': globalQuery.data ?? emptyGlobalState,
      '/trending': trendingQuery.data ?? emptyTrendingState,
    })
  }, [
    store,
    coins,
    sync,
    caption,
    error,
    initialAccount,
    walletQuery.data,
    seriesQuery.data,
    globalQuery.data,
    trendingQuery.data,
  ])

  function handleToggleWatch({ assetId, watched }: { assetId: string; watched: boolean }) {
    if (!signedIn) {
      setPrompted(true)
      return
    }
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
      chart: null,
      focus: null,
      columns: null,
      elements: null,
    })
  }

  async function handleOpenChart({ assetId }: { assetId: string }) {
    await setView({
      focus: assetId,
      surface: 'chart',
      elements: null,
    })
  }

  return {
    store,
    liveSpec,
    showAuthRequired,
    notices,
    emptyWatchlist,
    watchedIds,
    isAtCap,
    pendingAssetId: watchMutation.isPending ? watchMutation.variables?.assetId : undefined,
    focusedAssetId: focus,
    handleToggleWatch,
    handleOpenChart,
    handleResetView,
  }
}
