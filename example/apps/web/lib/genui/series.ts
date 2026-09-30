import type { CoinMarket } from "@/lib/coins/board";
import type { SearchQueryState } from "@/lib/coins/search-query";

export interface SeriesCandle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface SeriesState {
  assetId: string;
  interval: string;
  candles: SeriesCandle[];
  source: string;
  provider: string;
}

export const emptySeriesState: SeriesState = {
  assetId: "bitcoin",
  candles: [],
  interval: "1h",
  provider: "fixture",
  source: "fixture",
};

export function seriesAssetId({
  query,
  coins,
  focus,
}: {
  query: SearchQueryState;
  coins: CoinMarket[];
  focus?: string | null;
}): string {
  const token = focus ?? query.symbols[0] ?? query.highlight[0];
  if (!token) {
    return "bitcoin";
  }
  const match = coins.find(
    (coin) => coin.id === token || coin.symbol.toLowerCase() === token
  );
  return match?.id ?? (token === "btc" ? "bitcoin" : token);
}
