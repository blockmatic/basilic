import { findAssetIdByNetwork, getLinkedEip155 } from '@repo/db'
import { getQuote } from '@repo/markets'
import {
  amountFromHex,
  getNfts,
  getWallet,
  isAlchemyKeyUnset,
  type OnchainNft,
  type OnchainToken,
  type PortfolioNetwork,
  vendorStatus,
} from '@repo/onchain'
import { logger } from '@repo/utils/logger/server'

const caipByNetwork: Record<PortfolioNetwork, string> = {
  'eth-mainnet': 'eip155:1',
  'base-mainnet': 'eip155:8453',
}

export type WalletTokenDto = {
  network: PortfolioNetwork
  tokenAddress: string | null
  symbol: string | null
  name: string | null
  amount: string
  quoteUsd: number | null
  logoUrl: string | null
  assetId: string | null
}

export type WalletNftDto = {
  network: PortfolioNetwork
  contractAddress: string
  tokenId: string
  name: string | null
  collectionName: string | null
  imageUrl: string | null
}

export type WalletDto = {
  address: string | null
  tokens: WalletTokenDto[]
  nfts: WalletNftDto[]
  error: string | null
}

export const emptyWallet = {
  address: null,
  tokens: [],
  nfts: [],
  error: null,
} satisfies WalletDto

async function quoteForToken({ token }: { token: OnchainToken }): Promise<WalletTokenDto> {
  const { assetId } = await findAssetIdByNetwork({
    chainCaip2: caipByNetwork[token.network],
    contractAddress: token.tokenAddress,
    isNative: token.tokenAddress == null,
  })
  let quoteUsd: number | null = null
  if (assetId)
    try {
      const quote = await getQuote({ assetId })
      quoteUsd = quote.price
    } catch (err) {
      logger.warn({ err, assetId }, 'wallet quote skipped')
    }
  return {
    network: token.network,
    tokenAddress: token.tokenAddress,
    symbol: token.symbol,
    name: token.name,
    amount: amountFromHex({ balanceHex: token.balanceHex, decimals: token.decimals }),
    quoteUsd,
    logoUrl: token.logoUrl,
    assetId,
  }
}

function toNftDto({ nft }: { nft: OnchainNft }): WalletNftDto {
  return {
    network: nft.network,
    contractAddress: nft.contractAddress,
    tokenId: nft.tokenId,
    name: nft.name,
    collectionName: nft.collectionName,
    imageUrl: nft.imageUrl,
  }
}

export async function composeOwnWallet({ userId }: { userId: string }): Promise<WalletDto> {
  const { identity } = await getLinkedEip155({ userId })
  if (!identity) return emptyWallet
  try {
    const [{ tokens }, { nfts }] = await Promise.all([
      getWallet({ address: identity.address }),
      getNfts({ address: identity.address }),
    ])
    return {
      address: identity.address,
      tokens: await Promise.all(tokens.map(token => quoteForToken({ token }))),
      nfts: nfts.map(nft => toNftDto({ nft })),
      error: null,
    }
  } catch (err) {
    if (isAlchemyKeyUnset(err))
      return { address: identity.address, tokens: [], nfts: [], error: null }
    const status = vendorStatus(err)
    logger.warn({ err, status, userId }, 'alchemy wallet read failed')
    return {
      address: identity.address,
      tokens: [],
      nfts: [],
      error: status === 429 ? 'Alchemy rate limited' : 'Alchemy unavailable',
    }
  }
}
