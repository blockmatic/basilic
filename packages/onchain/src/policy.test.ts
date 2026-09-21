import { describe, expect, it, vi } from 'vitest'
import { fetchAllowed, isAllowedUrl } from './policy.js'

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

describe('onchain policy', () => {
  it('allowlists only Alchemy Data API https host', () => {
    expect(isAllowedUrl('https://api.g.alchemy.com/data/v1/key/assets/tokens/by-address')).toBe(
      true,
    )
    expect(isAllowedUrl('http://api.g.alchemy.com/data/v1/key')).toBe(false)
    expect(isAllowedUrl('https://api.coingecko.com/api/v3/ping')).toBe(false)
    expect(isAllowedUrl('https://eth-mainnet.g.alchemy.com/v2/demo')).toBe(false)
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
    await expect(
      fetchAllowed('https://api.g.alchemy.com/data/v1/key/assets/tokens/by-address'),
    ).rejects.toThrow(/redirect cross origin/)
    expect(fetchMock.mock.calls.some(call => requestUrl(call[0]).includes('evil.example'))).toBe(
      false,
    )
  })
})
