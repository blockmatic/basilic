import { describe, expect, it, vi } from 'vitest'
import { fetchAllowed, isAllowedUrl } from './policy.js'

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

describe('markets policy', () => {
  it('allowlists only CoinGecko and Binance https hosts', () => {
    expect(isAllowedUrl('https://api.coingecko.com/api/v3/ping')).toBe(true)
    expect(isAllowedUrl('https://data-api.binance.vision/api/v3/ping')).toBe(true)
    expect(isAllowedUrl('http://api.coingecko.com/api/v3/ping')).toBe(false)
    expect(isAllowedUrl('https://api.g.alchemy.com/tokens')).toBe(false)
    expect(isAllowedUrl('https://evil.example/')).toBe(false)
  })

  it('does not follow a redirect off the allowlist', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestUrl(input)
      if (url.includes('evil.example'))
        return new Response('nope', { status: 200, headers: { 'Content-Type': 'text/plain' } })
      return new Response(null, {
        status: 302,
        headers: { Location: 'https://evil.example/steal' },
      })
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchAllowed('https://api.coingecko.com/api/v3/ping')).rejects.toThrow(
      /redirect off allowlist/,
    )
    expect(fetchMock.mock.calls.some(call => requestUrl(call[0]).includes('evil.example'))).toBe(
      false,
    )
  })
})
