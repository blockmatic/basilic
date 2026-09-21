import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { closeDb, configureDb, getDb, resetDbInstance } from './client.js'
import { runMigrations } from './migrate.js'
import { users, walletIdentities } from './schema/index.js'
import { countLinkedEip155, getLinkedEip155 } from './wallets.js'

const userA = 'user-a'
const userB = 'user-b'
const addressA = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const addressB = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

describe('getLinkedEip155', () => {
  beforeAll(async () => {
    const pgliteInstance = new PGlite()
    await pgliteInstance.waitReady
    configureDb({ pglite: true, pgliteInstance })
    await runMigrations()
  })

  beforeEach(async () => {
    const db = await getDb()
    await db.delete(walletIdentities)
    await db.delete(users)
    const now = new Date()
    await db.insert(users).values([
      { id: userA, email: 'a@test.ai', emailVerified: true, createdAt: now, updatedAt: now },
      { id: userB, email: 'b@test.ai', emailVerified: true, createdAt: now, updatedAt: now },
    ])
    await db.insert(walletIdentities).values([
      {
        id: 'wa',
        userId: userA,
        chain: 'eip155',
        address: addressA,
        createdAt: now,
        lastUsedAt: now,
      },
      {
        id: 'wb',
        userId: userB,
        chain: 'eip155',
        address: addressB,
        createdAt: now,
        lastUsedAt: now,
      },
    ])
  })

  afterAll(async () => {
    resetDbInstance()
    await closeDb()
  })

  it('returns only that user eip155 identity', async () => {
    expect((await getLinkedEip155({ userId: userA })).identity?.address).toBe(addressA)
    expect((await getLinkedEip155({ userId: userB })).identity?.address).toBe(addressB)
    expect((await countLinkedEip155({ userId: userA })).count).toBe(1)
  })
})
