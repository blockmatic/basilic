import { getDb } from '@repo/db'
import { assets, coinWatches } from '@repo/db/schema'
import { inArray } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../coins.spec.js'

const extraWatchAssetIds = Array.from({ length: 19 }, (_, i) => `watch-extra-${i}`)

type WatchItem = { id: string; assetId: string; createdAt: string }

function bearer({ jwt }: { jwt: string }) {
  return { Authorization: `Bearer ${jwt}` }
}

async function seedFixtureAssets({ jwt }: { jwt: string }) {
  const response = await fastify.inject({
    method: 'GET',
    url: '/coins',
    headers: bearer({ jwt }),
  })
  expect(response.statusCode).toBe(200)
}

describe('GET PUT DELETE /coins/watches', () => {
  beforeEach(async () => {
    const db = await getDb()
    await db.delete(coinWatches)
    await db.delete(assets).where(inArray(assets.id, extraWatchAssetIds))
  })

  it('returns 401 without JWT', async () => {
    const list = await fastify.inject({ method: 'GET', url: '/coins/watches' })
    const put = await fastify.inject({ method: 'PUT', url: '/coins/watches/bitcoin' })
    const del = await fastify.inject({ method: 'DELETE', url: '/coins/watches/bitcoin' })
    expect(list.statusCode).toBe(401)
    expect(list.json().code).toBe('UNAUTHORIZED')
    expect(put.statusCode).toBe(401)
    expect(put.json().code).toBe('UNAUTHORIZED')
    expect(del.statusCode).toBe(401)
    expect(del.json().code).toBe('UNAUTHORIZED')
  })

  it('returns an empty array when the caller has no watches', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-watch-empty@test.ai')
    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/watches',
      headers: bearer({ jwt }),
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
  })

  it('puts bitcoin by asset id, is idempotent, and omits geckoId', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-a@test.ai')
    await seedFixtureAssets({ jwt })
    const headers = bearer({ jwt })
    const first = await fastify.inject({ method: 'PUT', url: '/coins/watches/bitcoin', headers })
    const second = await fastify.inject({ method: 'PUT', url: '/coins/watches/bitcoin', headers })
    expect(first.statusCode).toBe(200)
    expect(second.statusCode).toBe(200)
    const firstBody = first.json() as WatchItem
    const secondBody = second.json() as WatchItem
    expect(firstBody.assetId).toBe('bitcoin')
    expect(firstBody).not.toHaveProperty('geckoId')
    expect(secondBody.id).toBe(firstBody.id)
    const listed = await fastify.inject({ method: 'GET', url: '/coins/watches', headers })
    expect(listed.statusCode).toBe(200)
    expect((listed.json() as WatchItem[]).map(row => row.assetId)).toEqual(['bitcoin'])
  })

  it('returns 404 NOT_FOUND for an unknown asset id', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-a@test.ai')
    const response = await fastify.inject({
      method: 'PUT',
      url: '/coins/watches/not-a-real-asset',
      headers: bearer({ jwt }),
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('NOT_FOUND')
  })

  it('returns 409 WATCHLIST_FULL on the 21st distinct asset', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-watch-cap@test.ai')
    await seedFixtureAssets({ jwt })
    const headers = bearer({ jwt })
    const first = await fastify.inject({ method: 'PUT', url: '/coins/watches/bitcoin', headers })
    expect(first.statusCode).toBe(200)

    const db = await getDb()
    const now = new Date()
    await db.insert(assets).values(
      extraWatchAssetIds.map(id => ({
        id,
        symbol: id.slice(0, 8),
        name: id,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })),
    )
    for (const assetId of extraWatchAssetIds) {
      const response = await fastify.inject({
        method: 'PUT',
        url: `/coins/watches/${assetId}`,
        headers,
      })
      expect(response.statusCode).toBe(200)
    }

    const overflow = await fastify.inject({
      method: 'PUT',
      url: '/coins/watches/ethereum',
      headers,
    })
    expect(overflow.statusCode).toBe(409)
    expect(overflow.json().code).toBe('WATCHLIST_FULL')
  })

  it('deletes with 204 even when the row is missing', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-a@test.ai')
    await seedFixtureAssets({ jwt })
    const headers = bearer({ jwt })
    const missing = await fastify.inject({
      method: 'DELETE',
      url: '/coins/watches/bitcoin',
      headers,
    })
    expect(missing.statusCode).toBe(204)
    await fastify.inject({ method: 'PUT', url: '/coins/watches/bitcoin', headers })
    const removed = await fastify.inject({
      method: 'DELETE',
      url: '/coins/watches/bitcoin',
      headers,
    })
    expect(removed.statusCode).toBe(204)
    const listed = await fastify.inject({ method: 'GET', url: '/coins/watches', headers })
    expect(listed.json()).toEqual([])
  })

  it('does not list user A watches for user B', async () => {
    const jwtA = await getOrCreateSession(fastify, 'coins-a@test.ai')
    const jwtB = await getOrCreateSession(fastify, 'coins-b@test.ai')
    await seedFixtureAssets({ jwt: jwtA })
    const put = await fastify.inject({
      method: 'PUT',
      url: '/coins/watches/bitcoin',
      headers: bearer({ jwt: jwtA }),
    })
    expect(put.statusCode).toBe(200)
    const listedB = await fastify.inject({
      method: 'GET',
      url: '/coins/watches',
      headers: bearer({ jwt: jwtB }),
    })
    expect(listedB.statusCode).toBe(200)
    expect(listedB.json()).toEqual([])
  })
})
