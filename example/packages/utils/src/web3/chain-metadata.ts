import isNumber from "lodash-es/isNumber";
import isString from "lodash-es/isString";
import type { Chain } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from "viem/chains";

import type { ChainType } from "./chain-type.js";

export interface ChainMetadata {
  chainType: ChainType;
  chainId: number | string;
  name: string;
  viemChain?: Chain;
  defaultRpcUrl?: string;
}

const evmChains: Record<number, ChainMetadata> = {
  1: {
    chainId: 1,
    chainType: "evm",
    defaultRpcUrl: "https://cloudflare-eth.com",
    name: "Ethereum Mainnet",
    viemChain: mainnet,
  },
  10: {
    chainId: 10,
    chainType: "evm",
    name: "Optimism",
    viemChain: optimism,
  },
  11155111: {
    chainId: 11155111,
    chainType: "evm",
    name: "Ethereum Sepolia",
    viemChain: sepolia,
  },
  11155420: {
    chainId: 11155420,
    chainType: "evm",
    name: "Optimism Sepolia",
    viemChain: optimismSepolia,
  },
  137: {
    chainId: 137,
    chainType: "evm",
    name: "Polygon",
    viemChain: polygon,
  },
  42161: {
    chainId: 42161,
    chainType: "evm",
    name: "Arbitrum One",
    viemChain: arbitrum,
  },
  421614: {
    chainId: 421614,
    chainType: "evm",
    name: "Arbitrum Sepolia",
    viemChain: arbitrumSepolia,
  },
  80002: {
    chainId: 80002,
    chainType: "evm",
    name: "Polygon Amoy",
    viemChain: polygonAmoy,
  },
  8453: {
    chainId: 8453,
    chainType: "evm",
    name: "Base Mainnet",
    viemChain: base,
  },
  84532: {
    chainId: 84532,
    chainType: "evm",
    name: "Base Sepolia",
    viemChain: baseSepolia,
  },
};

const solanaClusters: Record<string, ChainMetadata> = {
  devnet: {
    chainId: "devnet",
    chainType: "solana",
    defaultRpcUrl: "https://api.devnet.solana.com",
    name: "Solana Devnet",
  },
  "mainnet-beta": {
    chainId: "mainnet-beta",
    chainType: "solana",
    defaultRpcUrl: "https://api.mainnet-beta.solana.com",
    name: "Solana Mainnet",
  },
  testnet: {
    chainId: "testnet",
    chainType: "solana",
    defaultRpcUrl: "https://api.testnet.solana.com",
    name: "Solana Testnet",
  },
};

const chainRegistry = new Map<string, ChainMetadata>();

Object.values(evmChains).forEach((chain) => {
  chainRegistry.set(String(chain.chainId), chain);
});

Object.values(solanaClusters).forEach((chain) => {
  chainRegistry.set(String(chain.chainId), chain);
});

export function getChainMetadata(
  chainId: number | string
): ChainMetadata | undefined {
  if (isString(chainId)) {
    const byChainId = chainRegistry.get(chainId);
    if (byChainId) {
      return byChainId;
    }

    const bySolanaCluster = solanaClusters[chainId];
    if (bySolanaCluster) {
      return bySolanaCluster;
    }
  }

  if (isNumber(chainId)) {
    return evmChains[chainId];
  }

  if (isString(chainId) && /^\d+$/.test(chainId)) {
    const numericId = Number(chainId);
    return evmChains[numericId];
  }

  return undefined;
}
