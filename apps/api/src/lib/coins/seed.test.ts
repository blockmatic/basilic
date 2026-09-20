import { count, eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { getDb } from '../../db/index.js'
import { coinMarkets, coinSync } from '../../db/schema/index.js'
import { mockMarketRows, seedMockMarkets } from './seed.js'

describe('seedMockMarkets', () => {
  it('upserts fixture rows without duplicating', async () => {
    const db = await getDb()
    await seedMockMarkets({ db })
    await seedMockMarkets({ db })

    const [row] = await db.select({ n: count() }).from(coinMarkets)
    expect(row?.n).toBeGreaterThanOrEqual(6)
    expect(row?.n).toBe(mockMarketRows.length)

    const ids = (await db.select({ id: coinMarkets.id }).from(coinMarkets)).map(item => item.id)
    expect(ids).toEqual(expect.arrayContaining(['bitcoin', 'ethereum', 'solana']))

    const [sync] = await db.select().from(coinSync).where(eq(coinSync.id, 'global'))
    expect(sync?.source).toBe('mock')
    expect(sync?.fetchedAt).toBeNull()
  })
})
