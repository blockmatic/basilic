import isNumber from 'lodash-es/isNumber'
import isString from 'lodash-es/isString'
import type { Chain } from 'viem'
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
} from 'viem/chains'
import type { ChainType } from './chain-type'

export type { ChainType }
export * from './alchemy'
export { chainTypeSchema } from './chain-type'

export interface ChainMetadata {
  chainType: ChainType
  chainId: number | string
  name: string
  viemChain?: Chain
  defaultRpcUrl?: string
}

// EVM Chain ID to metadata mapping
const EVM_CHAINS: Record<number, ChainMetadata> = {
  // Ethereum
  1: {
    chainType: 'evm',
    chainId: 1,
    name: 'Ethereum Mainnet',
    viemChain: mainnet,
    defaultRpcUrl: 'https://cloudflare-eth.com',
  },
  11155111: {
    chainType: 'evm',
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    viemChain: sepolia,
  },
  // Arbitrum
  42161: {
    chainType: 'evm',
    chainId: 42161,
    name: 'Arbitrum One',
    viemChain: arbitrum,
  },
  421614: {
    chainType: 'evm',
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    viemChain: arbitrumSepolia,
  },
  // Base
  8453: {
    chainType: 'evm',
    chainId: 8453,
    name: 'Base Mainnet',
    viemChain: base,
  },
  84532: {
    chainType: 'evm',
    chainId: 84532,
    name: 'Base Sepolia',
    viemChain: baseSepolia,
  },
  // Optimism
  10: {
    chainType: 'evm',
    chainId: 10,
    name: 'Optimism',
    viemChain: optimism,
  },
  11155420: {
    chainType: 'evm',
    chainId: 11155420,
    name: 'Optimism Sepolia',
    viemChain: optimismSepolia,
  },
  // Polygon
  137: {
    chainType: 'evm',
    chainId: 137,
    name: 'Polygon',
    viemChain: polygon,
  },
  80002: {
    chainType: 'evm',
    chainId: 80002,
    name: 'Polygon Amoy',
    viemChain: polygonAmoy,
  },
}

// Solana cluster mapping
const SOLANA_CLUSTERS: Record<string, ChainMetadata> = {
  'mainnet-beta': {
    chainType: 'solana',
    chainId: 'mainnet-beta',
    name: 'Solana Mainnet',
    defaultRpcUrl: 'https://api.mainnet-beta.solana.com',
  },
  devnet: {
    chainType: 'solana',
    chainId: 'devnet',
    name: 'Solana Devnet',
    defaultRpcUrl: 'https://api.devnet.solana.com',
  },
  testnet: {
    chainType: 'solana',
    chainId: 'testnet',
    name: 'Solana Testnet',
    defaultRpcUrl: 'https://api.testnet.solana.com',
  },
}

// Combined chain registry (Chain ID -> Metadata)
const CHAIN_REGISTRY = new Map<string, ChainMetadata>()

// Populate registry from EVM chains
Object.values(EVM_CHAINS).forEach(chain => {
  CHAIN_REGISTRY.set(String(chain.chainId), chain)
})

// Populate registry from Solana clusters
Object.values(SOLANA_CLUSTERS).forEach(chain => {
  CHAIN_REGISTRY.set(String(chain.chainId), chain)
})

/**
 * Get chain type from chain ID
 */
export function getChainType(chainId: number | string): ChainType | undefined {
  const metadata = getChainMetadata(chainId)
  return metadata?.chainType
}

/**
 * Get chain metadata from chain ID
 */
export function getChainMetadata(chainId: number | string): ChainMetadata | undefined {
  // Try as string chain ID
  if (isString(chainId)) {
    const byChainId = CHAIN_REGISTRY.get(chainId)
    if (byChainId) return byChainId

    // Try as Solana cluster name
    const bySolanaCluster = SOLANA_CLUSTERS[chainId]
    if (bySolanaCluster) return bySolanaCluster
  }

  // Try as numeric chain ID (EVM)
  if (isNumber(chainId)) {
    return EVM_CHAINS[chainId]
  }

  // Try parsing as number
  const numericId = Number(chainId)
  if (!Number.isNaN(numericId)) {
    return EVM_CHAINS[numericId]
  }

  return undefined
}

/**
 * Check if chain is supported
 */
export function isSupportedChain(chainId: number | string): boolean {
  return getChainMetadata(chainId) !== undefined
}
