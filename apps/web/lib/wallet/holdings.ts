export interface WalletToken {
  network: "eth-mainnet" | "base-mainnet";
  tokenAddress: string | null;
  symbol: string | null;
  name: string | null;
  amount: string;
  quoteUsd: number | null;
  logoUrl: string | null;
  assetId: string | null;
}

export interface WalletNft {
  network: "eth-mainnet" | "base-mainnet";
  contractAddress: string;
  tokenId: string;
  name: string | null;
  collectionName: string | null;
  imageUrl: string | null;
}

export interface WalletState {
  address: string | null;
  tokens: WalletToken[];
  nfts: WalletNft[];
  error: string | null;
}

export const emptyWalletState: WalletState = {
  address: null,
  error: null,
  nfts: [],
  tokens: [],
};
