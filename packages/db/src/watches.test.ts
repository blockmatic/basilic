import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getAccountSnapshot } from './account-snapshot.js'
import { listAssets } from './assets.js'
import { closeDb, configureDb, getDb, resetDbInstance } from './client.js'
import { runMigrations } from './migrate.js'
import { assets, coinWatches, sessions, users } from './schema/index.js'
import { getValidSession } from './sessions.js'
import { listWatches, unwatchAsset, watchAsset } from './watches.js'

const userA = 'user-a'
const userB = 'user-b'
const bitcoin = 'bitcoin'
const ethereum = 'ethereum'

async function seedIdentityRows() {
  const db = await getDb()
  const now = new Date()
  await db.insert(users).values([
    {
      id: userA,
      email: 'a@test.ai',
      name: 'Ada',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
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
}

describe('named db fns', () => {
  beforeAll(async () => {
    const pgliteInstance = new PGlite()
    await pgliteInstance.waitReady
    configureDb({ pglite: true, pgliteInstance })
    await runMigrations()
  })

  beforeEach(async () => {
    const db = await getDb()
    await db.delete(coinWatches)
    await db.delete(sessions)
    await db.delete(assets)
    await db.delete(users)
    await seedIdentityRows()
  })

  afterAll(async () => {
    resetDbInstance()
    await closeDb()
  })

  it('listAssets has no userId and returns enabled rows', async () => {
    const { assets: rows } = await listAssets()
    expect(rows.map(row => row.id).sort()).toEqual([bitcoin, ethereum])
  })

  it('listWatches for user A does not include user B rows', async () => {
    await watchAsset({ userId: userA, assetId: bitcoin })
    await watchAsset({ userId: userB, assetId: ethereum })

    const { watches: watchesA } = await listWatches({ userId: userA })
    const { watches: watchesB } = await listWatches({ userId: userB })

    expect(watchesA.map(row => row.assetId)).toEqual([bitcoin])
    expect(watchesB.map(row => row.assetId)).toEqual([ethereum])
  })

  it('watchAsset is idempotent per user and asset and caps at 20', async () => {
    const first = await watchAsset({ userId: userA, assetId: bitcoin })
    const second = await watchAsset({ userId: userA, assetId: bitcoin })
    expect(first.watch?.id).toBe(second.watch?.id)

    const db = await getDb()
    const extraIds = Array.from({ length: 19 }, (_, i) => `asset-${i}`)
    const now = new Date()
    await db.insert(assets).values(
      extraIds.map(id => ({
        id,
        symbol: id.slice(0, 8),
        name: id,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })),
    )
    for (const assetId of extraIds) {
      const { error } = await watchAsset({ userId: userA, assetId })
      expect(error).toBeUndefined()
    }

    const { watch, error } = await watchAsset({ userId: userA, assetId: ethereum })
    expect(watch).toBeNull()
    expect(error).toBe('limit')
  })

  it('unwatchAsset removes only that user row', async () => {
    await watchAsset({ userId: userA, assetId: bitcoin })
    await watchAsset({ userId: userB, assetId: bitcoin })
    await unwatchAsset({ userId: userA, assetId: bitcoin })

    const { watches: watchesA } = await listWatches({ userId: userA })
    const { watches: watchesB } = await listWatches({ userId: userB })
    expect(watchesA).toEqual([])
    expect(watchesB.map(row => row.assetId)).toEqual([bitcoin])
  })

  it('getAccountSnapshot returns only that user profile', async () => {
    const { account: accountA } = await getAccountSnapshot({ userId: userA })
    const { account: accountB } = await getAccountSnapshot({ userId: userB })
    expect(accountA?.email).toBe('a@test.ai')
    expect(accountA?.name).toBe('Ada')
    expect(accountB?.email).toBe('b@test.ai')
    expect(accountB?.name).toBeNull()
    expect(await getAccountSnapshot({ userId: 'missing' })).toEqual({ account: null })
  })

  it('getValidSession returns the row only when sid, expiry, and userId match', async () => {
    const db = await getDb()
    const now = new Date()
    await db.insert(sessions).values({
      id: 'sid-a',
      token: 'token-a',
      userId: userA,
      expiresAt: new Date(now.getTime() + 60_000),
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(sessions).values({
      id: 'sid-expired',
      token: 'token-expired',
      userId: userA,
      expiresAt: new Date(now.getTime() - 60_000),
      createdAt: now,
      updatedAt: now,
    })

    expect(await getValidSession({ sid: 'sid-a', userId: userA })).toMatchObject({
      session: { id: 'sid-a', userId: userA },
      user: { id: userA },
    })
    expect(await getValidSession({ sid: 'sid-a', userId: userB })).toBeNull()
    expect(await getValidSession({ sid: 'sid-expired', userId: userA })).toBeNull()
    expect(await getValidSession({ sid: 'missing', userId: userA })).toBeNull()
  })
})
