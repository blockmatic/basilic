import { describe, expect, it } from 'vitest'
import { klineQueryFromPeriod } from './kline-period.js'

describe('klineQueryFromPeriod', () => {
  it('maps 7d to a 1h interval and a 7d range, not a kline interval of 7d', () => {
    expect(klineQueryFromPeriod({ period: '7d' })).toEqual({ interval: '1h', range: '7d' })
  })

  it('maps 1y and 6m onto mhdw ranges Binance limit math can parse', () => {
    expect(klineQueryFromPeriod({ period: '1y' })).toEqual({ interval: '1w', range: '52w' })
    expect(klineQueryFromPeriod({ period: '6m' })).toEqual({ interval: '1d', range: '26w' })
  })

  it('defaults unset and unknown periods to 7d', () => {
    expect(klineQueryFromPeriod({ period: undefined })).toEqual({ interval: '1h', range: '7d' })
    expect(klineQueryFromPeriod({ period: '7d' })).toEqual(
      klineQueryFromPeriod({ period: undefined }),
    )
  })
})
