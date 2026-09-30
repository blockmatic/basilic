import { findBinanceMarket } from "@repo/db";
import { getCandles } from "@repo/markets";
import type { CandlesResult } from "@repo/markets";

import { klineQueryFromPeriod } from "./kline-period.js";

export async function getCoinCandles({
  assetId,
  period,
}: {
  assetId: string;
  period?: string;
}): Promise<CandlesResult> {
  const { interval, range } = klineQueryFromPeriod({ period });
  const { market } = await findBinanceMarket({ assetId });
  return getCandles({
    assetId,
    interval,
    mapping: market ? { binanceSymbol: market.symbol } : undefined,
    range,
  });
}
