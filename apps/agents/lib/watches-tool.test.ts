import { PGlite } from '@electric-sql/pglite'
import { closeDb, configureDb, getDb, listWatches, resetDbInstance, watchAsset } from '@repo/db'
import { runMigrations } from '@repo/db/migrate'
import { assets, coinWatches, users } from '@repo/db/schema'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { userIdFromCtx } from './principal.js'

const userA = 'user-a'
const userB = 'user-b'
const bitcoin = 'bitcoin'
const ethereum = 'ethereum'

function ctxFor(userId: string) {
  return { session: { auth: { current: { principalId: userId } } } }
}

describe('list_watches ACL', () => {
  beforeAll(async () => {
    const pgliteInstance = new PGlite()
    await pgliteInstance.waitReady
    configureDb({ pglite: true, pgliteInstance })
    await runMigrations()
  })

  beforeEach(async () => {
    const db = await getDb()
    await db.delete(coinWatches)
    await db.delete(assets)
    await db.delete(users)
    const now = new Date()
    await db.insert(users).values([
      { id: userA, email: 'a@test.ai', emailVerified: true, createdAt: now, updatedAt: now },
      { id: userB, email: 'b@test.ai', emailVerified: true, createdAt: now, updatedAt: now },
    ])
    await db.insert(assets).values([
      {
        id: bitcoin,
        symbol: 'BTC',
        name: 'Bitcoin',
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: ethereum,
        symbol: 'ETH',
        name: 'Ethereum',
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    await watchAsset({ userId: userA, assetId: bitcoin })
    await watchAsset({ userId: userB, assetId: ethereum })
  })

  afterAll(async () => {
    resetDbInstance()
    await closeDb()
  })

  it('lists only the JWT principal watches', async () => {
    const a = await listWatches({ userId: userIdFromCtx({ ctx: ctxFor(userA) }) })
    const b = await listWatches({ userId: userIdFromCtx({ ctx: ctxFor(userB) }) })
    expect(a.watches.map(row => row.assetId)).toEqual([bitcoin])
    expect(b.watches.map(row => row.assetId)).toEqual([ethereum])
  })
})
