import { describe, expect, it } from 'vitest'
import { buildKlinesUrl, buildTickerUrl } from './binance.js'

describe('Binance URLs', () => {
  it('fails ticker/24hr without symbol', () => {
    expect(() => buildTickerUrl({ symbol: '' })).toThrow(/symbol/)
  })

  it('always includes symbol on ticker/24hr', () => {
    const url = new URL(buildTickerUrl({ symbol: 'BTCUSDT' }))
    expect(url.origin).toBe('https://data-api.binance.vision')
    expect(url.searchParams.get('symbol')).toBe('BTCUSDT')
  })

  it('fails klines without symbol', () => {
    expect(() => buildKlinesUrl({ symbol: '' })).toThrow(/symbol/)
  })
})
