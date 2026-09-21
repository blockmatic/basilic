import type { GetCoinGlobalResponse, GetCoinTrendingResponse } from '@repo/core'

export type GlobalState = GetCoinGlobalResponse
export type TrendingState = GetCoinTrendingResponse
export type TrendingCoinState = TrendingState['coins'][number]

export const emptyGlobalState: GlobalState = {
  marketCapUsd: 0,
  volumeUsd: 0,
  btcDominance: 0,
  source: 'fixture',
}

export const emptyTrendingState: TrendingState = {
  coins: [],
  source: 'fixture',
}
