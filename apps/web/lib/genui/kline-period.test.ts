import { describe, expect, it } from 'vitest'
import { klineQueryFromPeriod } from './kline-period'

describe('klineQueryFromPeriod', () => {
  it('maps 7d to interval 1h and range 7d', () => {
    expect(klineQueryFromPeriod({ period: '7d' })).toEqual({ interval: '1h', range: '7d' })
  })

  it('defaults a missing period to 7d', () => {
    expect(klineQueryFromPeriod({ period: null })).toEqual({ interval: '1h', range: '7d' })
  })
})
