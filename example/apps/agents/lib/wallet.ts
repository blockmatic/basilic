import { findAssetIdByNetwork, getLinkedEip155 } from "@repo/db";
import { getQuote } from "@repo/markets";
import {
  amountFromHex,
  getNfts,
  getWallet,
  isAlchemyKeyUnset,
  vendorStatus,
} from "@repo/onchain";
import type { OnchainNft, OnchainToken, PortfolioNetwork } from "@repo/onchain";
import { logger } from "@repo/utils/logger/server";

const caipByNetwork: Record<PortfolioNetwork, string> = {
  "base-mainnet": "eip155:8453",
  "eth-mainnet": "eip155:1",
};

export interface WalletTokenDto {
  network: PortfolioNetwork;
  tokenAddress: string | null;
  symbol: string | null;
  name: string | null;
  amount: string;
  quoteUsd: number | null;
  logoUrl: string | null;
  assetId: string | null;
}

export interface WalletNftDto {
  network: PortfolioNetwork;
  contractAddress: string;
  tokenId: string;
  name: string | null;
  collectionName: string | null;
  imageUrl: string | null;
}

export interface WalletDto {
  address: string | null;
  tokens: WalletTokenDto[];
  nfts: WalletNftDto[];
  error: string | null;
}

const emptyWallet = {
  address: null,
  error: null,
  nfts: [],
  tokens: [],
} satisfies WalletDto;

async function quoteForToken({
  token,
}: {
  token: OnchainToken;
}): Promise<WalletTokenDto> {
  const { assetId } = await findAssetIdByNetwork({
    chainCaip2: caipByNetwork[token.network],
    contractAddress: token.tokenAddress,
    isNative: token.tokenAddress == null,
  });
  let quoteUsd: number | null = null;
  if (assetId) {
    try {
      const quote = await getQuote({ assetId });
      quoteUsd = quote.price;
    } catch (err) {
      logger.warn({ err, assetId }, "wallet quote skipped");
    }
  }
  return {
    amount: amountFromHex({
      balanceHex: token.balanceHex,
      decimals: token.decimals,
    }),
    assetId,
    logoUrl: token.logoUrl,
    name: token.name,
    network: token.network,
    quoteUsd,
    symbol: token.symbol,
    tokenAddress: token.tokenAddress,
  };
}

function toNftDto({ nft }: { nft: OnchainNft }): WalletNftDto {
  return {
    collectionName: nft.collectionName,
    contractAddress: nft.contractAddress,
    imageUrl: nft.imageUrl,
    name: nft.name,
    network: nft.network,
    tokenId: nft.tokenId,
  };
}

export async function composeOwnWallet({
  userId,
}: {
  userId: string;
}): Promise<WalletDto> {
  const { identity } = await getLinkedEip155({ userId });
  if (!identity) {
    return emptyWallet;
  }
  try {
    const [{ tokens }, { nfts }] = await Promise.all([
      getWallet({ address: identity.address }),
      getNfts({ address: identity.address }),
    ]);
    return {
      address: identity.address,
      error: null,
      nfts: nfts.map((nft) => toNftDto({ nft })),
      tokens: await Promise.all(
        tokens.map((token) => quoteForToken({ token }))
      ),
    };
  } catch (error) {
    if (isAlchemyKeyUnset(error))
      return { address: identity.address, tokens: [], nfts: [], error: null };
    const status = vendorStatus(error);
    logger.warn({ error, status, userId }, "alchemy wallet read failed");
    return {
      address: identity.address,
      error: status === 429 ? "Alchemy rate limited" : "Alchemy unavailable",
      nfts: [],
      tokens: [],
    };
  }
}
