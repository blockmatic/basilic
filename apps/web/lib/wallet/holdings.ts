export type WalletToken = {
  network: 'eth-mainnet' | 'base-mainnet'
  tokenAddress: string | null
  symbol: string | null
  name: string | null
  amount: string
  quoteUsd: number | null
  logoUrl: string | null
  assetId: string | null
}

export type WalletNft = {
  network: 'eth-mainnet' | 'base-mainnet'
  contractAddress: string
  tokenId: string
  name: string | null
  collectionName: string | null
  imageUrl: string | null
}

export type WalletState = {
  address: string | null
  tokens: WalletToken[]
  nfts: WalletNft[]
  error: string | null
}

export const emptyWalletState: WalletState = {
  address: null,
  tokens: [],
  nfts: [],
  error: null,
}
