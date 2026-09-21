export const portfolioNetworks = ['eth-mainnet', 'base-mainnet'] as const

export type PortfolioNetwork = (typeof portfolioNetworks)[number]

export type OnchainToken = {
  network: PortfolioNetwork
  tokenAddress: string | null
  balanceHex: string
  symbol: string | null
  name: string | null
  decimals: number | null
  logoUrl: string | null
}

export type OnchainNft = {
  network: PortfolioNetwork
  contractAddress: string
  tokenId: string
  name: string | null
  collectionName: string | null
  imageUrl: string | null
}

export type GetWalletArgs = { address: string }
export type GetNftsArgs = { address: string }

export type WalletResult = { tokens: OnchainToken[] }
export type NftsResult = { nfts: OnchainNft[] }
