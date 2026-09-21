import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { findBinanceMarket } from './assets.js'
import { closeDb, configureDb, getDb, resetDbInstance } from './client.js'
import { runMigrations } from './migrate.js'
import { assetMarkets, assets } from './schema/index.js'

describe('findBinanceMarket', () => {
  beforeAll(async () => {
    const pgliteInstance = new PGlite()
    await pgliteInstance.waitReady
    configureDb({ pglite: true, pgliteInstance })
    await runMigrations()
  })

  beforeEach(async () => {
    const db = await getDb()
    await db.delete(assetMarkets)
    await db.delete(assets)
    const now = new Date()
    await db.insert(assets).values([
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'unmapped',
        symbol: 'zzz',
        name: 'Unmapped',
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    await db.insert(assetMarkets).values({
      id: 'binance:BTCUSDT',
      assetId: 'bitcoin',
      provider: 'binance',
      symbol: 'BTCUSDT',
      quote: 'USDT',
    })
  })

  afterAll(async () => {
    resetDbInstance()
    await closeDb()
  })

  it('returns the Binance symbol for a mapped asset', async () => {
    expect(await findBinanceMarket({ assetId: 'bitcoin' })).toEqual({
      market: { symbol: 'BTCUSDT' },
    })
  })

  it('returns null when the asset has no Binance market', async () => {
    expect(await findBinanceMarket({ assetId: 'unmapped' })).toEqual({ market: null })
  })
})
