import { getDb } from '@repo/db'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetCoinGeckoClient, resetMarketsRuntime } from '../markets/index.js'
import { queryCoins } from './query.js'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('queryCoins', () => {
  beforeEach(() => {
    resetMarketsRuntime()
    resetCoinGeckoClient()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse('rate', 429)),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('filters fixture minChangePct 5 to doge', async () => {
    const db = await getDb()
    const result = await queryCoins({
      db,
      userId: 'query-coins-user',
      query: { minChangePct: 5 },
    })
    expect(result.sync.source).toBe('fixture')
    expect(result.coins.map(coin => coin.id)).toEqual(['dogecoin'])
    expect(result.spokenSummary.toLowerCase()).toContain('doge')
    expect(result.spokenSummary).not.toContain('$')
  })
})
