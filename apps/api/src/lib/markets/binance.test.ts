import { describe, expect, it } from 'vitest'
import { binanceQuoteMatchesVs, buildKlinesUrl, buildTickerUrl } from './binance.js'

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

  it('matches usd quotes to USD and USDT pairs only', () => {
    expect(binanceQuoteMatchesVs({ symbol: 'BTCUSDT', vs: 'usd' })).toBe(true)
    expect(binanceQuoteMatchesVs({ symbol: 'BTCUSD', vs: 'usd' })).toBe(true)
    expect(binanceQuoteMatchesVs({ symbol: 'ETHBTC', vs: 'usd' })).toBe(false)
    expect(binanceQuoteMatchesVs({ symbol: 'BTCUSDT', vs: 'eur' })).toBe(false)
  })
})
