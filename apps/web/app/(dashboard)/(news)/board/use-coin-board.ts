"use client";

import { createStateStore } from "@json-render/react";
import { getErrorMessage } from "@repo/error";
import { useReactApiConfig, useUser } from "@repo/react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { boardNotices, mapListCoins } from "@/lib/coins/board";
import { clearedSearchQuery, toCoinsQuery } from "@/lib/coins/search-query";
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
} from "@/lib/genui";
import {
  accountWalletQueryKey,
  coinsCandlesQueryKey,
  coinsGlobalQueryKey,
  coinsListQueryKey,
  coinsListQueryKeyPrefix,
  coinsTrendingQueryKey,
  coinWatchesQueryKey,
} from "@/lib/query-keys";
import { emptyWalletState } from "@/lib/wallet";

import { useAccountRequiredPrompt } from "./account-required";
import { isInitialBoardView } from "./coin-board";
import type { CoinBoardProps } from "./coin-board";

const watchCap = 20;
const boardStaleMs = 30_000;

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
  const { client } = useReactApiConfig();
  const { data: session, isLoading: isSessionLoading } = useUser();
  const signedIn = Boolean(session?.user);
  const { prompted, setPrompted } = useAccountRequiredPrompt();
  const queryClient = useQueryClient();
  const [view, setView] = useQueryStates(boardViewParsers, {
    history: "push",
    shallow: true,
  });
  const { query, surface, period, chart, focus, columns, elements } =
    splitBoardView({ view });
  const fetchQuery = overlayAccountQuery({ query, surface });
  const needsAccount =
    surface === "account" || fetchQuery.universe === "watchlist" || prompted;
  const showAuthRequired = !isSessionLoading && !signedIn && needsAccount;
  const isInitial = isInitialBoardView({
    chart,
    columns,
    elements,
    focus,
    initialChart,
    initialColumns,
    initialElements,
    initialFocus,
    initialPeriod,
    initialQuery,
    initialSurface,
    period,
    query,
    surface,
  });
  const [store] = useState(() =>
    createStateStore({
      account: initialAccount,
      caption: initialCaption,
      coins: initialCoins,
      error: initialError,
      global: initialGlobal,
      series: emptySeriesState,
      sync: initialSync,
      trending: initialTrending,
      wallet: emptyWalletState,
    })
  );

  const listQuery = useQuery({
    enabled: !showAuthRequired,
    initialData: isInitial
      ? { coins: initialCoins, sync: initialSync, queryCaption: initialCaption }
      : undefined,
    placeholderData: keepPreviousData,
    queryFn: async () =>
      mapListCoins({
        data: await client.listCoins({
          query: toCoinsQuery({ query: fetchQuery }),
        }),
      }),
    queryKey: coinsListQueryKey(fetchQuery),
    staleTime: boardStaleMs,
  });
  const watchesQuery = useQuery({
    enabled: signedIn,
    initialData: initialWatchedIds,
    queryFn: async () => {
      const watches = await client.coins.watches.watches();
      return watches.map((watch) => watch.assetId);
    },
    queryKey: coinWatchesQueryKey,
    staleTime: boardStaleMs,
  });
  const walletQuery = useQuery({
    enabled: signedIn,
    queryFn: () => client.account.wallet(),
    queryKey: accountWalletQueryKey,
    staleTime: boardStaleMs,
  });
  const seriesAsset = seriesAssetId({
    coins: listQuery.data?.coins ?? initialCoins,
    focus,
    query: fetchQuery,
  });
  const candlePeriod = period ?? defaultCandlePeriod;
  const seriesQuery = useQuery({
    enabled: !showAuthRequired,
    queryFn: () =>
      client.coins.assetId.candles({
        path: { assetId: seriesAsset },
        query: { period: candlePeriod },
      }),
    queryKey: coinsCandlesQueryKey({
      assetId: seriesAsset,
      period: candlePeriod,
    }),
    staleTime: boardStaleMs,
  });
  const globalQuery = useQuery({
    initialData: isInitial ? initialGlobal : undefined,
    queryFn: () => client.coins.global(),
    queryKey: coinsGlobalQueryKey,
    staleTime: boardStaleMs,
  });
  const trendingQuery = useQuery({
    initialData: isInitial ? initialTrending : undefined,
    queryFn: () => client.coins.trending(),
    queryKey: coinsTrendingQueryKey,
    staleTime: boardStaleMs,
  });
  const watchMutation = useMutation({
    mutationFn: async ({
      assetId,
      nextWatched,
    }: {
      assetId: string;
      nextWatched: boolean;
    }) => {
      if (nextWatched)
        await client.coins.watches.assetId.watch({ path: { assetId } });
      else await client.coins.watches.assetId.id({ path: { assetId } });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinWatchesQueryKey });
      if (fetchQuery.universe === "watchlist")
        await queryClient.invalidateQueries({
          queryKey: coinsListQueryKeyPrefix,
        });
    },
  });

  const board = listQuery.data ?? {
    coins: initialCoins,
    queryCaption: initialCaption,
    sync: initialSync,
  };
  const { coins } = board;
  const { sync } = board;
  const caption = board.queryCaption;
  const error = listQuery.error
    ? getErrorMessage(listQuery.error)
    : isInitial
      ? initialError
      : null;
  const watchedIds = new Set(watchesQuery.data ?? []);
  const isAtCap = watchedIds.size >= watchCap;
  const notices = error ? [] : boardNotices({ sync });
  const emptyWatchlist =
    fetchQuery.universe === "watchlist" && coins.length === 0 && !error;
  const liveView = viewFromSearchQuery({
    chart,
    columns,
    elements,
    period,
    query: fetchQuery,
    surface,
    title: viewTitle({ surface, caption }),
  });
  const liveSpec = isInitial
    ? spec
    : elements.length
      ? specFromSelection({ elements, view: liveView })
      : composeSurface({ view: liveView });

  useEffect(() => {
    store.update({
      "/account": initialAccount,
      "/caption": caption,
      "/coins": coins,
      "/error": error,
      "/global": globalQuery.data ?? emptyGlobalState,
      "/series": seriesQuery.data ?? emptySeriesState,
      "/sync": sync,
      "/trending": trendingQuery.data ?? emptyTrendingState,
      "/wallet": walletQuery.data ?? emptyWalletState,
    });
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
  ]);

  function handleToggleWatch({
    assetId,
    watched,
  }: {
    assetId: string;
    watched: boolean;
  }) {
    if (!signedIn) {
      setPrompted(true);
      return;
    }
    if (!watched && isAtCap) {
      toast.error("Watchlist is full");
      return;
    }
    watchMutation.mutate({ assetId, nextWatched: !watched });
  }

  async function handleResetView() {
    await setView({
      ...clearedSearchQuery,
      chart: null,
      columns: null,
      elements: null,
      focus: null,
      period: null,
      surface: null,
    });
  }

  async function handleOpenChart({ assetId }: { assetId: string }) {
    await setView({
      elements: null,
      focus: assetId,
      surface: "chart",
    });
  }

  return {
    emptyWatchlist,
    focusedAssetId: focus,
    handleOpenChart,
    handleResetView,
    handleToggleWatch,
    isAtCap,
    liveSpec,
    notices,
    pendingAssetId: watchMutation.isPending
      ? watchMutation.variables?.assetId
      : undefined,
    showAuthRequired,
    store,
    watchedIds,
  };
}
