import type {
  GetCoinGlobalResponse,
  GetCoinTrendingResponse,
} from "@repo/core";

export type GlobalState = GetCoinGlobalResponse;
export type TrendingState = GetCoinTrendingResponse;
export type TrendingCoinState = TrendingState["coins"][number];

export const emptyGlobalState: GlobalState = {
  btcDominance: 0,
  marketCapUsd: 0,
  source: "fixture",
  volumeUsd: 0,
};

export const emptyTrendingState: TrendingState = {
  coins: [],
  source: "fixture",
};
