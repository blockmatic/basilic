import { count, eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { getDb } from '../../db/index.js'
import { assetMarkets, assetNetworks, assetProviders, assets } from '../../db/schema/index.js'
import { fixtureQuotes } from './fixture.js'
import { seedIdentity } from './seed.js'

describe('seedIdentity', () => {
  it('upserts identity rows without duplicating', async () => {
    const db = await getDb()
    await seedIdentity({ db })
    await seedIdentity({ db })

    const [row] = await db.select({ n: count() }).from(assets)
    expect(row?.n).toBe(fixtureQuotes.length)

    const ids = (await db.select({ id: assets.id }).from(assets)).map(item => item.id)
    expect(ids).toEqual(expect.arrayContaining(['bitcoin', 'ethereum', 'solana']))

    const [providers] = await db.select({ n: count() }).from(assetProviders)
    expect(providers?.n).toBe(fixtureQuotes.length)

    const [markets] = await db.select({ n: count() }).from(assetMarkets)
    expect(markets?.n).toBe(fixtureQuotes.length)

    const [native] = await db
      .select()
      .from(assetNetworks)
      .where(eq(assetNetworks.id, 'eip155:1:native'))
    expect(native?.assetId).toBe('ethereum')
    expect(native?.isNative).toBe(true)
    expect(native?.chainCaip2).toBe('eip155:1')
  })
})
