import { afterEach, describe, expect, it, vi } from 'vitest'
import { getNfts, getWallet, isAlchemyKeyUnset } from './capabilities.js'
import { configureOnchain } from './config.js'
import type { OnchainHttpError } from './policy.js'

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

describe('onchain capabilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws when the Alchemy key is unset', async () => {
    configureOnchain({})
    await expect(getWallet({ address: '0xabc' })).rejects.toSatisfy(isAlchemyKeyUnset)
  })

  it('POSTs tokens by-address and maps DTO without prices', async () => {
    configureOnchain({ alchemyApiKey: 'test-key' })
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: {
          tokens: [
            {
              network: 'eth-mainnet',
              tokenAddress: null,
              tokenBalance: '0x1',
              tokenMetadata: {
                symbol: 'ETH',
                name: 'Ether',
                decimals: 18,
                logo: 'https://cdn/eth',
              },
              tokenPrices: [{ currency: 'usd', value: '4000' }],
            },
          ],
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const result = await getWallet({ address: '0xabc' })
    expect(result.tokens).toEqual([
      {
        network: 'eth-mainnet',
        tokenAddress: null,
        balanceHex: '0x1',
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        logoUrl: 'https://cdn/eth',
      },
    ])
    const url = requestUrl(fetchMock.mock.calls[0]?.[0] as RequestInfo)
    expect(url).toContain('https://api.g.alchemy.com/data/v1/test-key/assets/tokens/by-address')
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(JSON.parse(String(init.body)).withPrices).toBe(false)
  })

  it('POSTs nfts by-address with spam filter and prefers cachedUrl', async () => {
    configureOnchain({ alchemyApiKey: 'test-key' })
    const fetchMock = vi.fn(async () =>
      Response.json({
        data: {
          ownedNfts: [
            {
              network: 'base-mainnet',
              contract: { address: '0xnft', name: 'Fixture Apes' },
              tokenId: '7',
              name: 'Fixture Ape #7',
              image: {
                cachedUrl: 'https://nft-cdn.alchemy.com/7.png',
                originalUrl: 'https://unbounded.example/orig.png',
              },
              collection: { name: 'Fixture Apes' },
            },
          ],
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const result = await getNfts({ address: '0xabc' })
    expect(result.nfts).toEqual([
      {
        network: 'base-mainnet',
        contractAddress: '0xnft',
        tokenId: '7',
        name: 'Fixture Ape #7',
        collectionName: 'Fixture Apes',
        imageUrl: 'https://nft-cdn.alchemy.com/7.png',
      },
    ])
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(JSON.parse(String(init.body)).excludeFilters).toEqual(['SPAM'])
  })

  it('throws OnchainHttpError 429 without calling a second host', async () => {
    configureOnchain({ alchemyApiKey: 'test-key' })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('slow down', { status: 429 })),
    )
    await expect(getWallet({ address: '0xabc' })).rejects.toMatchObject({
      name: 'OnchainHttpError',
      status: 429,
    } satisfies Partial<OnchainHttpError>)
  })
})
