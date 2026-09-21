import { findBinanceMarket } from '@repo/db'
import { type CandlesResult, getCandles } from '@repo/markets'
import { klineQueryFromPeriod } from './kline-period.js'

export async function getCoinCandles({
  assetId,
  period,
}: {
  assetId: string
  period?: string
}): Promise<CandlesResult> {
  const { interval, range } = klineQueryFromPeriod({ period })
  const { market } = await findBinanceMarket({ assetId })
  return getCandles({
    assetId,
    interval,
    range,
    mapping: market ? { binanceSymbol: market.symbol } : undefined,
  })
}
