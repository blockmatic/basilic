import { getOnchainConfig } from './config.js'
import { alchemyOrigin, fetchAllowed, OnchainHttpError } from './policy.js'
import type {
  GetNftsArgs,
  GetWalletArgs,
  NftsResult,
  OnchainNft,
  OnchainToken,
  PortfolioNetwork,
  WalletResult,
} from './types.js'
import { portfolioNetworks } from './types.js'

const keyUnset = 'alchemy key unset'

function requireKey(): string {
  const { alchemyApiKey } = getOnchainConfig()
  if (!alchemyApiKey) throw new Error(keyUnset)
  return alchemyApiKey
}

function portfolioUrl({ key, path }: { key: string; path: string }): string {
  return `${alchemyOrigin}/data/v1/${key}${path}`
}

function isPortfolioNetwork(value: unknown): value is PortfolioNetwork {
  return typeof value === 'string' && (portfolioNetworks as readonly string[]).includes(value)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) return null
  return value as Record<string, unknown>
}

async function postPortfolio({
  path,
  body,
}: {
  path: string
  body: Record<string, unknown>
}): Promise<unknown> {
  const key = requireKey()
  const response = await fetchAllowed(portfolioUrl({ key, path }), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (response.status === 429)
    throw new OnchainHttpError({ status: 429, message: 'alchemy rate limited' })
  if (!response.ok)
    throw new OnchainHttpError({ status: response.status, message: 'alchemy request failed' })
  return response.json()
}

function mapToken(row: unknown): OnchainToken | null {
  const rec = asRecord(row)
  if (!rec || !isPortfolioNetwork(rec.network) || typeof rec.tokenBalance !== 'string') return null
  const meta = asRecord(rec.tokenMetadata)
  const tokenAddress = typeof rec.tokenAddress === 'string' ? rec.tokenAddress : null
  return {
    network: rec.network,
    tokenAddress,
    balanceHex: rec.tokenBalance,
    symbol: typeof meta?.symbol === 'string' ? meta.symbol : null,
    name: typeof meta?.name === 'string' ? meta.name : null,
    decimals: typeof meta?.decimals === 'number' ? meta.decimals : null,
    logoUrl: typeof meta?.logo === 'string' ? meta.logo : null,
  }
}

function mapNft(row: unknown): OnchainNft | null {
  const rec = asRecord(row)
  if (!rec || !isPortfolioNetwork(rec.network)) return null
  const contract = asRecord(rec.contract)
  const image = asRecord(rec.image)
  const collection = asRecord(rec.collection)
  const contractAddress = typeof contract?.address === 'string' ? contract.address : null
  const tokenId = typeof rec.tokenId === 'string' ? rec.tokenId : null
  if (!contractAddress || !tokenId) return null
  const cached = typeof image?.cachedUrl === 'string' ? image.cachedUrl : null
  const thumb = typeof image?.thumbnailUrl === 'string' ? image.thumbnailUrl : null
  return {
    network: rec.network,
    contractAddress,
    tokenId,
    name: typeof rec.name === 'string' ? rec.name : null,
    collectionName:
      typeof collection?.name === 'string'
        ? collection.name
        : typeof contract?.name === 'string'
          ? contract.name
          : null,
    imageUrl: cached ?? thumb,
  }
}

export function isAlchemyKeyUnset(err: unknown): boolean {
  return err instanceof Error && err.message === keyUnset
}

export async function getWallet({ address }: GetWalletArgs): Promise<WalletResult> {
  const json = await postPortfolio({
    path: '/assets/tokens/by-address',
    body: {
      addresses: [{ address, networks: [...portfolioNetworks] }],
      withMetadata: true,
      withPrices: false,
    },
  })
  const data = asRecord(asRecord(json)?.data)
  const tokens = Array.isArray(data?.tokens) ? data.tokens : []
  return { tokens: tokens.map(mapToken).filter((row): row is OnchainToken => row !== null) }
}

export async function getNfts({ address }: GetNftsArgs): Promise<NftsResult> {
  const json = await postPortfolio({
    path: '/assets/nfts/by-address',
    body: {
      addresses: [{ address, networks: [...portfolioNetworks] }],
      excludeFilters: ['SPAM'],
      withMetadata: true,
    },
  })
  const data = asRecord(asRecord(json)?.data)
  const owned = Array.isArray(data?.ownedNfts) ? data.ownedNfts : []
  return { nfts: owned.map(mapNft).filter((row): row is OnchainNft => row !== null) }
}
