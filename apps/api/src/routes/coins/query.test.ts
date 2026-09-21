import { getDb, watchAsset } from '@repo/db'
import { coinWatches } from '@repo/db/schema'
import { resetCoinGeckoClient, resetMarketsRuntime } from '@repo/markets'
import { beforeEach, describe, expect, it } from 'vitest'
import { getOrCreateSession } from '../../../test/utils/auth-helper.js'
import { fastify } from './coins.spec.js'

type QueryBody = {
  coins: { id: string; symbol: string; name: string; change24h: number; highlighted: boolean }[]
  spokenSummary: string
  queryCaption: string
  query: { universe: string; sortBy: string; sortDir: string; symbols?: string[] }
  sync: { source: string }
}

async function userIdFor({ jwt }: { jwt: string }): Promise<string> {
  const response = await fastify.inject({
    method: 'GET',
    url: '/auth/session/user',
    headers: { Authorization: `Bearer ${jwt}` },
  })
  return (response.json() as { user: { id: string } }).user.id
}

async function queryCoins({
  jwt,
  payload = {},
}: {
  jwt: string
  payload?: Record<string, unknown>
}) {
  return fastify.inject({
    method: 'POST',
    url: '/coins/query',
    headers: { Authorization: `Bearer ${jwt}` },
    payload,
  })
}

describe('POST /coins/query and GET /coins filters', () => {
  beforeEach(async () => {
    resetMarketsRuntime()
    resetCoinGeckoClient()
    const db = await getDb()
    await db.delete(coinWatches)
  })

  it('returns 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/coins/query',
      payload: { minChangePct: 5 },
    })
    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('keeps only coins at or above minChangePct', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const response = await queryCoins({ jwt, payload: { minChangePct: 5 } })
    expect(response.statusCode).toBe(200)
    const body = response.json() as QueryBody
    expect(body.coins.every(coin => coin.change24h >= 5)).toBe(true)
    expect(body.spokenSummary.length).toBeLessThanOrEqual(320)
    expect(body.spokenSummary).not.toContain('$')
    expect(body.queryCaption.toLowerCase()).toContain('percent')
  })

  it('returns an empty watchlist with spoken empty copy', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query-empty@test.ai')
    const response = await queryCoins({ jwt, payload: { universe: 'watchlist' } })
    expect(response.statusCode).toBe(200)
    const body = response.json() as QueryBody
    expect(body.coins).toEqual([])
    expect(body.spokenSummary).toBe('Your list is empty.')
  })

  it('keeps only majors', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const response = await queryCoins({ jwt, payload: { universe: 'majors' } })
    expect(response.statusCode).toBe(200)
    expect((response.json() as QueryBody).coins.map(coin => coin.symbol).sort()).toEqual([
      'btc',
      'eth',
      'sol',
    ])
  })

  it('matches text dog on name or symbol', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const response = await queryCoins({ jwt, payload: { text: 'dog' } })
    expect(response.statusCode).toBe(200)
    const body = response.json() as QueryBody
    expect(
      body.coins.every(
        coin =>
          coin.name.toLowerCase().includes('dog') || coin.symbol.toLowerCase().includes('dog'),
      ),
    ).toBe(true)
  })

  it('returns only the caller watch after insert', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-a@test.ai')
    await queryCoins({ jwt })
    const userId = await userIdFor({ jwt })
    const { error } = await watchAsset({ userId, assetId: 'dogecoin' })
    expect(error).toBeUndefined()
    const response = await queryCoins({ jwt, payload: { universe: 'watchlist' } })
    expect(response.statusCode).toBe(200)
    expect((response.json() as QueryBody).coins.map(coin => coin.id)).toEqual(['dogecoin'])
  })

  it('says nothing matches when a watchlist has rows but filters remove them', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-a@test.ai')
    await queryCoins({ jwt })
    const userId = await userIdFor({ jwt })
    await watchAsset({ userId, assetId: 'bitcoin' })
    const response = await queryCoins({
      jwt,
      payload: { universe: 'watchlist', text: 'zzzz-no-match' },
    })
    expect(response.statusCode).toBe(200)
    const body = response.json() as QueryBody
    expect(body.coins).toEqual([])
    expect(body.spokenSummary).toBe('Nothing matches that filter.')
  })

  it('does not leak user A watches to user B', async () => {
    const jwtA = await getOrCreateSession(fastify, 'coins-a@test.ai')
    const jwtB = await getOrCreateSession(fastify, 'coins-b@test.ai')
    await queryCoins({ jwt: jwtA })
    const userA = await userIdFor({ jwt: jwtA })
    await watchAsset({ userId: userA, assetId: 'bitcoin' })
    const response = await queryCoins({ jwt: jwtB, payload: { universe: 'watchlist' } })
    expect(response.statusCode).toBe(200)
    const body = response.json() as QueryBody
    expect(body.coins).toEqual([])
    expect(body.spokenSummary).toBe('Your list is empty.')
  })

  it('matches GET comma arrays to POST arrays', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const headers = { Authorization: `Bearer ${jwt}` }
    const fromGet = await fastify.inject({
      method: 'GET',
      url: '/coins?symbols=eth,sol',
      headers,
    })
    const fromPost = await fastify.inject({
      method: 'POST',
      url: '/coins/query',
      headers,
      payload: { symbols: ['eth', 'sol'] },
    })
    expect(fromGet.statusCode).toBe(200)
    expect(fromPost.statusCode).toBe(200)
    const getBody = fromGet.json() as QueryBody
    const postBody = fromPost.json() as QueryBody
    expect(getBody.coins.map(coin => coin.id)).toEqual(postBody.coins.map(coin => coin.id))
    expect(getBody.spokenSummary).toBe(postBody.spokenSummary)
    expect(getBody.queryCaption).toBe(postBody.queryCaption)
    expect(getBody.query.symbols).toEqual(['eth', 'sol'])
  })

  it('matches GET sort querystring to POST body', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const headers = { Authorization: `Bearer ${jwt}` }
    const fromGet = await fastify.inject({
      method: 'GET',
      url: '/coins?sortBy=change24h&sortDir=desc',
      headers,
    })
    const fromPost = await queryCoins({
      jwt,
      payload: { sortBy: 'change24h', sortDir: 'desc' },
    })
    expect(fromGet.statusCode).toBe(200)
    expect(fromPost.statusCode).toBe(200)
    const getBody = fromGet.json() as QueryBody
    const postBody = fromPost.json() as QueryBody
    expect(getBody.coins.map(coin => coin.id)).toEqual(postBody.coins.map(coin => coin.id))
    expect(getBody.spokenSummary).toBe(postBody.spokenSummary)
    expect(getBody.queryCaption.toLowerCase()).toMatch(/mover|change/)
    expect(getBody.queryCaption.toLowerCase()).not.toContain('doge')
  })
})
