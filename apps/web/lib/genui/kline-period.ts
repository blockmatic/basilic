import { periodValues, type ViewPeriod } from './view-config'

export const defaultCandlePeriod = '7d' as const satisfies ViewPeriod

const klineByPeriod = {
  '24h': { interval: '15m', range: '24h' },
  '7d': { interval: '1h', range: '7d' },
  '30d': { interval: '4h', range: '30d' },
  '90d': { interval: '1d', range: '90d' },
  '6m': { interval: '1d', range: '26w' },
  '1y': { interval: '1w', range: '52w' },
} as const satisfies Record<ViewPeriod, { interval: string; range: string }>

export function klineQueryFromPeriod({ period }: { period: ViewPeriod | null | undefined }): {
  interval: string
  range: string
} {
  return klineByPeriod[period && periodValues.includes(period) ? period : defaultCandlePeriod]
}
