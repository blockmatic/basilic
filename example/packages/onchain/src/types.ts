export const portfolioNetworks = ["eth-mainnet", "base-mainnet"] as const;

export type PortfolioNetwork = (typeof portfolioNetworks)[number];

export interface OnchainToken {
  network: PortfolioNetwork;
  tokenAddress: string | null;
  balanceHex: string;
  symbol: string | null;
  name: string | null;
  decimals: number | null;
  logoUrl: string | null;
}

export interface OnchainNft {
  network: PortfolioNetwork;
  contractAddress: string;
  tokenId: string;
  name: string | null;
  collectionName: string | null;
  imageUrl: string | null;
}

export interface GetWalletArgs {
  address: string;
}
export interface GetNftsArgs {
  address: string;
}

export interface WalletResult {
  tokens: OnchainToken[];
}
export interface NftsResult {
  nfts: OnchainNft[];
}
