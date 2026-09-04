import { describe, expect, it } from 'vitest'
import {
  buildMarketCardSpec,
  marketSnapshotMock,
  pickMovers,
  toMarketRows,
} from './market-snapshot.js'

describe('market snapshot helpers', () => {
  it('parses CoinGecko-shaped rows and ignores junk', () => {
    const rows = toMarketRows([
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 1,
        price_change_percentage_24h: 2,
        market_cap_rank: 1,
      },
      { id: 'bad' },
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]?.id).toBe('bitcoin')
    expect(rows[0]?.currentPrice).toBe(1)
  })

  it('picks largest absolute 24h moves', () => {
    const movers = pickMovers(marketSnapshotMock)
    expect(movers.length).toBeGreaterThan(0)
    expect(movers.length).toBeLessThanOrEqual(5)
  })

  it('builds market-card spec', () => {
    const spec = buildMarketCardSpec({ movers: marketSnapshotMock.slice(0, 2), source: 'mock' })
    expect(spec.root).toBe('market-card-1')
    expect(spec.elements['market-card-1']?.type).toBe('MarketCard')
    expect(spec.elements['market-card-1']?.props.source).toBe('mock')
  })
})
