import { resetCoinGeckoClient, resetMarketsRuntime } from '@repo/markets'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateSession } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../coins.spec.js'

describe('GET /coins/global', () => {
  beforeEach(() => {
    resetMarketsRuntime()
    resetCoinGeckoClient()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/global',
    })
    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('returns HTTP 200 fixture stats when CoinGecko fails', async () => {
    const jwt = await getOrCreateSession(fastify, 'coins-global@test.ai')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )

    const response = await fastify.inject({
      method: 'GET',
      url: '/coins/global',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      source: 'fixture',
      btcDominance: 50,
    })
    expect(typeof response.json().marketCapUsd).toBe('number')
    expect(typeof response.json().volumeUsd).toBe('number')
  })
})
