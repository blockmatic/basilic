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
  dynamicNetworkId: string
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
    dynamicNetworkId: '1',
    name: 'Ethereum Mainnet',
    viemChain: mainnet,
    defaultRpcUrl: 'https://cloudflare-eth.com',
  },
  11155111: {
    chainType: 'evm',
    chainId: 11155111,
    dynamicNetworkId: '11155111',
    name: 'Ethereum Sepolia',
    viemChain: sepolia,
  },
  // Arbitrum
  42161: {
    chainType: 'evm',
    chainId: 42161,
    dynamicNetworkId: '42161',
    name: 'Arbitrum One',
    viemChain: arbitrum,
  },
  421614: {
    chainType: 'evm',
    chainId: 421614,
    dynamicNetworkId: '421614',
    name: 'Arbitrum Sepolia',
    viemChain: arbitrumSepolia,
  },
  // Base
  8453: {
    chainType: 'evm',
    chainId: 8453,
    dynamicNetworkId: '8453',
    name: 'Base Mainnet',
    viemChain: base,
  },
  84532: {
    chainType: 'evm',
    chainId: 84532,
    dynamicNetworkId: '84532',
    name: 'Base Sepolia',
    viemChain: baseSepolia,
  },
  // Optimism
  10: {
    chainType: 'evm',
    chainId: 10,
    dynamicNetworkId: '10',
    name: 'Optimism',
    viemChain: optimism,
  },
  11155420: {
    chainType: 'evm',
    chainId: 11155420,
    dynamicNetworkId: '11155420',
    name: 'Optimism Sepolia',
    viemChain: optimismSepolia,
  },
  // Polygon
  137: {
    chainType: 'evm',
    chainId: 137,
    dynamicNetworkId: '137',
    name: 'Polygon',
    viemChain: polygon,
  },
  80002: {
    chainType: 'evm',
    chainId: 80002,
    dynamicNetworkId: '80002',
    name: 'Polygon Amoy',
    viemChain: polygonAmoy,
  },
}

// Solana cluster mapping
const SOLANA_CLUSTERS: Record<string, ChainMetadata> = {
  'mainnet-beta': {
    chainType: 'solana',
    chainId: 'mainnet-beta',
    dynamicNetworkId: 'solana-mainnet',
    name: 'Solana Mainnet',
    defaultRpcUrl: 'https://api.mainnet-beta.solana.com',
  },
  devnet: {
    chainType: 'solana',
    chainId: 'devnet',
    dynamicNetworkId: 'solana-devnet',
    name: 'Solana Devnet',
    defaultRpcUrl: 'https://api.devnet.solana.com',
  },
  testnet: {
    chainType: 'solana',
    chainId: 'testnet',
    dynamicNetworkId: 'solana-testnet',
    name: 'Solana Testnet',
    defaultRpcUrl: 'https://api.testnet.solana.com',
  },
}

// Combined chain registry (Dynamic Network ID -> Metadata)
const CHAIN_REGISTRY = new Map<string, ChainMetadata>()

// Populate registry from EVM chains
Object.values(EVM_CHAINS).forEach(chain => {
  CHAIN_REGISTRY.set(chain.dynamicNetworkId, chain)
})

// Populate registry from Solana clusters
Object.values(SOLANA_CLUSTERS).forEach(chain => {
  CHAIN_REGISTRY.set(chain.dynamicNetworkId, chain)
})

/**
 * Get chain type from chain ID or Dynamic network ID
 */
export function getChainType(chainId: number | string): ChainType | undefined {
  const metadata = getChainMetadata(chainId)
  return metadata?.chainType
}

/**
 * Get chain metadata from chain ID or Dynamic network ID
 */
export function getChainMetadata(chainId: number | string): ChainMetadata | undefined {
  // Try as Dynamic network ID (string)
  if (isString(chainId)) {
    const byDynamicId = CHAIN_REGISTRY.get(chainId)
    if (byDynamicId) return byDynamicId

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
 * Get Dynamic network ID from chain ID
 */
export function getDynamicNetworkId(chainId: number | string): string | undefined {
  const metadata = getChainMetadata(chainId)
  return metadata?.dynamicNetworkId
}

/**
 * Check if chain is supported
 */
export function isSupportedChain(chainId: number | string): boolean {
  return getChainMetadata(chainId) !== undefined
}
