import { getDb, watchAsset } from '@repo/db'
import { coinWatches } from '@repo/db/schema'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateSession } from '../../../test/utils/auth-helper.js'
import { resetCoinGeckoClient, resetMarketsRuntime } from '../../lib/markets/index.js'
import { fastify } from './coins.spec.js'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

type QueryBody = {
  coins: { id: string; symbol: string; highlighted: boolean }[]
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
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse('rate', 429)),
    )
    const db = await getDb()
    await db.delete(coinWatches)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
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

  it('filters minChangePct to doge and speaks Dogecoin without dollar amounts', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const response = await queryCoins({ jwt, payload: { minChangePct: 5 } })
    expect(response.statusCode).toBe(200)
    const body = response.json() as QueryBody
    expect(body.sync.source).toBe('fixture')
    expect(body.coins.map(coin => coin.id)).toEqual(['dogecoin'])
    expect(body.spokenSummary.toLowerCase()).toContain('doge')
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

  it('keeps only majors from the fixture', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const response = await queryCoins({ jwt, payload: { universe: 'majors' } })
    expect(response.statusCode).toBe(200)
    expect((response.json() as QueryBody).coins.map(coin => coin.symbol).sort()).toEqual([
      'btc',
      'eth',
      'sol',
    ])
  })

  it('matches text dog to dogecoin', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const response = await queryCoins({ jwt, payload: { text: 'dog' } })
    expect(response.statusCode).toBe(200)
    expect((response.json() as QueryBody).coins.map(coin => coin.id)).toEqual(['dogecoin'])
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

  it('does not call live CoinGecko after the fixture circuit opens', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-query@test.ai')
    const fetchMock = vi.mocked(fetch)
    await queryCoins({ jwt, payload: { minChangePct: 5 } })
    fetchMock.mockClear()
    const response = await queryCoins({ jwt, payload: { minChangePct: 5 } })
    expect(response.statusCode).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
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
