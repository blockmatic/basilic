import { randomUUID } from 'node:crypto'
import { getDb } from '@repo/db'
import { walletIdentities } from '@repo/db/schema'
import { configureOnchain } from '@repo/onchain'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateSession } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../account.spec.js'

const addressA = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const addressB = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

async function sessionFor({ email }: { email: string }) {
  const jwt = await getOrCreateSession(fastify, email)
  const userRes = await fastify.inject({
    method: 'GET',
    url: '/auth/session/user',
    headers: { Authorization: `Bearer ${jwt}` },
  })
  return { jwt, userId: userRes.json().user.id as string }
}

describe('GET /account/wallet', () => {
  beforeEach(async () => {
    configureOnchain({ alchemyApiKey: 'test-key' })
    const db = await getDb()
    await db.delete(walletIdentities)
    vi.unstubAllGlobals()
  })

  it('returns 401 without JWT', async () => {
    const response = await fastify.inject({ method: 'GET', url: '/account/wallet' })
    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHORIZED')
  })

  it('returns empty holdings when no eip155 wallet is linked', async () => {
    const { jwt } = await sessionFor({ email: 'wallet-empty@test.ai' })
    const response = await fastify.inject({
      method: 'GET',
      url: '/account/wallet',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ address: null, tokens: [], nfts: [], error: null })
  })

  it('does not return user B holdings on user A JWT', async () => {
    const sessionA = await sessionFor({ email: 'coins-a@test.ai' })
    const sessionB = await sessionFor({ email: 'coins-b@test.ai' })
    const db = await getDb()
    const now = new Date()
    await db.insert(walletIdentities).values([
      {
        id: randomUUID(),
        userId: sessionA.userId,
        chain: 'eip155',
        address: addressA,
        createdAt: now,
        lastUsedAt: now,
      },
      {
        id: randomUUID(),
        userId: sessionB.userId,
        chain: 'eip155',
        address: addressB,
        createdAt: now,
        lastUsedAt: now,
      },
    ])
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = requestUrl(input)
        const body = JSON.parse(String(init?.body ?? '{}')) as {
          addresses?: { address?: string }[]
        }
        const address = body.addresses?.[0]?.address
        if (url.includes('/nfts/'))
          return Response.json({
            data: {
              ownedNfts:
                address === addressA
                  ? [
                      {
                        network: 'eth-mainnet',
                        contract: { address: '0xnft' },
                        tokenId: '1',
                        name: 'Ape A',
                        image: { cachedUrl: 'https://nft-cdn.alchemy.com/a.png' },
                        collection: { name: 'Apes' },
                      },
                    ]
                  : [],
            },
          })
        return Response.json({
          data: {
            tokens:
              address === addressA
                ? [
                    {
                      network: 'eth-mainnet',
                      tokenAddress: null,
                      tokenBalance: '0x1',
                      tokenMetadata: { symbol: 'ETH', name: 'Ether', decimals: 18 },
                    },
                  ]
                : [
                    {
                      network: 'base-mainnet',
                      tokenAddress: '0xusdc',
                      tokenBalance: '0x2',
                      tokenMetadata: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
                    },
                  ],
          },
        })
      }),
    )

    const resA = await fastify.inject({
      method: 'GET',
      url: '/account/wallet',
      headers: { Authorization: `Bearer ${sessionA.jwt}` },
    })
    const resB = await fastify.inject({
      method: 'GET',
      url: '/account/wallet',
      headers: { Authorization: `Bearer ${sessionB.jwt}` },
    })
    expect(resA.statusCode).toBe(200)
    expect(resB.statusCode).toBe(200)
    expect(resA.json().nfts.map((row: { name: string }) => row.name)).toEqual(['Ape A'])
    expect(resA.json().tokens.map((row: { symbol: string }) => row.symbol)).toEqual(['ETH'])
    expect(resB.json().tokens.map((row: { symbol: string }) => row.symbol)).toEqual(['USDC'])
    expect(resB.json().nfts).toEqual([])
  })

  it('returns empty holdings without Alchemy HTTP when the key is unset', async () => {
    configureOnchain({})
    const { jwt, userId } = await sessionFor({ email: 'wallet-nokey@test.ai' })
    const db = await getDb()
    const now = new Date()
    await db.insert(walletIdentities).values({
      id: randomUUID(),
      userId,
      chain: 'eip155',
      address: addressA,
      createdAt: now,
      lastUsedAt: now,
    })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await fastify.inject({
      method: 'GET',
      url: '/account/wallet',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ address: addressA, tokens: [], nfts: [], error: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns honesty error on Alchemy 429', async () => {
    const { jwt, userId } = await sessionFor({ email: 'wallet-429@test.ai' })
    const db = await getDb()
    const now = new Date()
    await db.insert(walletIdentities).values({
      id: randomUUID(),
      userId,
      chain: 'eip155',
      address: addressA,
      createdAt: now,
      lastUsedAt: now,
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('rate limited', { status: 429 })),
    )
    const response = await fastify.inject({
      method: 'GET',
      url: '/account/wallet',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      address: addressA,
      tokens: [],
      nfts: [],
      error: 'Alchemy rate limited',
    })
  })
})
