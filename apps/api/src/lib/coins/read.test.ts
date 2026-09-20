import { describe, expect, it } from 'vitest'
import { getDb } from '../../db/index.js'
import { coinMarkets, coinSync, coinWatches } from '../../db/schema/index.js'
import { listMarkets } from './read.js'
import { mockMarketRows } from './seed.js'

describe('listMarkets', () => {
  it('seeds an empty snapshot and returns mock sync', async () => {
    const db = await getDb()
    await db.delete(coinWatches)
    await db.delete(coinMarkets)
    await db.delete(coinSync)

    const result = await listMarkets({ db })
    expect(result.coins.map(coin => coin.id)).toEqual(mockMarketRows.map(row => row.id))
    expect(result.sync.source).toBe('mock')
    expect(result.sync.fetchedAt).toBeNull()
    expect(result.sync.lastError).toBeNull()
  })
})
