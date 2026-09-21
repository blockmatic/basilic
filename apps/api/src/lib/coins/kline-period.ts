export const candlePeriods = ['24h', '7d', '30d', '90d', '1y', '6m'] as const
export type CandlePeriod = (typeof candlePeriods)[number]
export const defaultCandlePeriod = '7d'

const klineByPeriod = {
  '24h': { interval: '15m', range: '24h' },
  '7d': { interval: '1h', range: '7d' },
  '30d': { interval: '4h', range: '30d' },
  '90d': { interval: '1d', range: '90d' },
  '6m': { interval: '1d', range: '26w' },
  '1y': { interval: '1w', range: '52w' },
} as const satisfies Record<CandlePeriod, { interval: string; range: string }>

export function klineQueryFromPeriod({ period }: { period: string | undefined }): {
  interval: string
  range: string
} {
  if (period && candlePeriods.includes(period as CandlePeriod))
    return klineByPeriod[period as CandlePeriod]
  return klineByPeriod[defaultCandlePeriod]
}
