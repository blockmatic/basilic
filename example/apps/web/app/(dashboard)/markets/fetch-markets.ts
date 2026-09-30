import type { ListCoinsData } from "@repo/core";
import { getErrorMessage } from "@repo/error";

import { getServerAuthToken } from "@/lib/auth/auth-server";
import { createBffClient } from "@/lib/auth/bff-client";
import { emptySync, mapListCoins } from "@/lib/coins/board";
import type { CoinBoardData, CoinMarket, MarketsSync } from "@/lib/coins/board";
import { emptyGlobalState, emptyTrendingState } from "@/lib/genui";
import type { GlobalState, TrendingState } from "@/lib/genui";

export type { CoinMarket, MarketsSync };

export async function fetchOverview(): Promise<{
  global: GlobalState;
  trending: TrendingState;
}> {
  const { token } = await getServerAuthToken();
  const { client } = token ? createBffClient({ token }) : createBffClient({});
  const [globalResult, trendingResult] = await Promise.allSettled([
    client.coins.global(),
    client.coins.trending(),
  ]);
  return {
    global:
      globalResult.status === "fulfilled"
        ? globalResult.value
        : emptyGlobalState,
    trending:
      trendingResult.status === "fulfilled"
        ? trendingResult.value
        : emptyTrendingState,
  };
}

export async function fetchMarkets({
  query,
}: {
  query?: NonNullable<ListCoinsData["query"]>;
} = {}): Promise<
  CoinBoardData & { watchedIds: string[]; error: string | null }
> {
  const { token } = await getServerAuthToken();
  if (query?.universe === "watchlist" && !token) {
    return {
      coins: [],
      sync: emptySync,
      queryCaption: "",
      watchedIds: [],
      error: null,
    };
  }

  const { client } = token ? createBffClient({ token }) : createBffClient({});
  const [coinsResult, watchesResult] = await Promise.allSettled([
    client.listCoins({ query }),
    token
      ? client.coins.watches.watches()
      : Promise.resolve([] as { assetId: string }[]),
  ]);
  const watchedIds =
    watchesResult.status === "fulfilled"
      ? watchesResult.value.map((watch) => watch.assetId)
      : [];
  if (coinsResult.status === "rejected") {
    return {
      coins: [],
      sync: emptySync,
      queryCaption: "",
      watchedIds,
      error: getErrorMessage(coinsResult.reason),
    };
  }

  return {
    ...mapListCoins({ data: coinsResult.value }),
    error: null,
    watchedIds,
  };
}
