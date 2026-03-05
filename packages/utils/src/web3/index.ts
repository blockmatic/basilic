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
import type { ChainType } from './chain-type.js'

export type { ChainType }
export * from './alchemy.js'
export { chainTypeSchema } from './chain-type.js'

/** SIWE/SIWS chain identifier: eip155 for EVM, solana for Solana */
export type Web3Chain = 'eip155' | 'solana'

/** Maps ChainType to Web3Chain for SIWE/SIWS auth. evm → eip155, solana → solana */
export function getWeb3Chain(chainType: ChainType): Web3Chain | undefined {
  if (chainType === 'evm') return 'eip155'
  if (chainType === 'solana') return 'solana'
  return undefined
}

/**
 * Metadata for a blockchain network.
 *
 * Contains information about the chain type, ID, name, and optional
 * Viem chain configuration and default RPC URL.
 *
 * @example
 * ```ts
 * const metadata: ChainMetadata = {
 *   chainType: 'evm',
 *   chainId: 1,
 *   name: 'Ethereum Mainnet',
 *   viemChain: mainnet,
 *   defaultRpcUrl: 'https://cloudflare-eth.com',
 * }
 * ```
 */
export interface ChainMetadata {
  /** Type of blockchain (e.g., 'evm', 'solana') */
  chainType: ChainType

  /** Chain ID (number for EVM, string for Solana clusters) */
  chainId: number | string

  /** Human-readable chain name */
  name: string

  /** Optional Viem chain configuration (for EVM chains) */
  viemChain?: Chain

  /** Optional default RPC endpoint URL */
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
 * Gets the chain type from a chain ID.
 *
 * @param chainId - Chain ID (number for EVM, string for Solana clusters)
 * @returns Chain type if found, undefined otherwise
 *
 * @example
 * ```ts
 * const chainType = getChainType(1) // Returns: 'evm'
 * const solanaType = getChainType('mainnet-beta') // Returns: 'solana'
 * ```
 */
export function getChainType(chainId: number | string): ChainType | undefined {
  const metadata = getChainMetadata(chainId)
  return metadata?.chainType
}

/**
 * Gets full chain metadata from a chain ID.
 *
 * Supports both EVM chains (numeric IDs) and Solana clusters (string names).
 * Returns undefined if the chain is not supported.
 *
 * @param chainId - Chain ID (number for EVM, string for Solana clusters)
 * @returns Chain metadata if found, undefined otherwise
 *
 * @example
 * ```ts
 * const metadata = getChainMetadata(1)
 * // Returns: { chainType: 'evm', chainId: 1, name: 'Ethereum Mainnet', ... }
 *
 * const solanaMetadata = getChainMetadata('mainnet-beta')
 * // Returns: { chainType: 'solana', chainId: 'mainnet-beta', name: 'Solana Mainnet', ... }
 * ```
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
  if (isNumber(chainId)) return EVM_CHAINS[chainId]

  // Try parsing as number
  const numericId = Number(chainId)
  if (!Number.isNaN(numericId)) return EVM_CHAINS[numericId]

  return undefined
}

/**
 * Checks if a chain ID is supported by the registry.
 *
 * @param chainId - Chain ID (number for EVM, string for Solana clusters)
 * @returns True if the chain is supported, false otherwise
 *
 * @example
 * ```ts
 * if (isSupportedChain(chainId)) {
 *   // Chain is supported, proceed with operations
 * }
 * ```
 */
export function isSupportedChain(chainId: number | string): boolean {
  return getChainMetadata(chainId) !== undefined
}

const SLICE_LEN = 8

/** Short display format for wallet address (chain:address or chain:first8chars… when long) */
export function formatWalletShort({ chain, address }: { chain: string; address: string }): string {
  const suffix = address.length > SLICE_LEN ? `${address.slice(0, SLICE_LEN)}…` : address
  return `${chain}:${suffix}`
}
