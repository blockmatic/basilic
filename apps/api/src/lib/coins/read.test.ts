import { describe, expect, it } from 'vitest'
import { getDb } from '../../db/index.js'
import {
  assetMarkets,
  assetNetworks,
  assetProviders,
  assets,
  coinWatches,
} from '../../db/schema/index.js'
import { fixtureQuotes } from './fixture.js'
import { listMarkets } from './read.js'

describe('listMarkets', () => {
  it('seeds identity and returns fixture quotes', async () => {
    const db = await getDb()
    await db.delete(coinWatches)
    await db.delete(assetMarkets)
    await db.delete(assetNetworks)
    await db.delete(assetProviders)
    await db.delete(assets)

    const result = await listMarkets({ db })
    expect(result.coins.map(coin => coin.id)).toEqual(fixtureQuotes.map(row => row.id))
    expect(result.sync.source).toBe('fixture')
    expect(result.sync.fetchedAt).toBeNull()
    expect(result.sync.lastError).toBeNull()
    expect(result.coins[0]?.priceUsd).toBe(fixtureQuotes[0].priceUsd)
  })
})
