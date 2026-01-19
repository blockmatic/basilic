import { getChainMetadata } from './index'

// EVM ChainId -> Alchemy network slug mapping
const ALCHEMY_EVM_SLUGS: Record<number, string> = {
  // Ethereum
  1: 'eth-mainnet',
  11155111: 'eth-sepolia',
  // Arbitrum
  42161: 'arb-mainnet',
  421614: 'arb-sepolia',
  // Base
  8453: 'base-mainnet',
  84532: 'base-sepolia',
  // Optimism
  10: 'opt-mainnet',
  11155420: 'opt-sepolia',
  // Polygon
  137: 'polygon-mainnet',
  80002: 'polygon-amoy',
} as const

// Solana cluster -> Alchemy network slug mapping
const ALCHEMY_SOLANA_SLUGS: Record<string, string> = {
  'mainnet-beta': 'solana-mainnet',
  devnet: 'solana-devnet',
  testnet: 'solana-testnet',
} as const

/**
 * Get Alchemy RPC endpoint URL for a given chainId
 * @param chainId - EVM chain ID (number) or Solana cluster name (string)
 * @param apiKey - Alchemy API key
 * @returns Alchemy RPC URL or undefined if chain not supported
 */
export function getAlchemyRpcUrl(chainId: number | string, apiKey: string): string | undefined {
  const metadata = getChainMetadata(chainId)
  if (!metadata) return undefined

  let slug: string | undefined

  if (metadata.chainType === 'evm' && typeof chainId === 'number') {
    slug = ALCHEMY_EVM_SLUGS[chainId]
  } else if (metadata.chainType === 'solana' && typeof chainId === 'string') {
    slug = ALCHEMY_SOLANA_SLUGS[chainId]
  }

  if (!slug) return undefined

  return `https://${slug}.g.alchemy.com/v2/${apiKey}`
}

/**
 * Get RPC endpoint with fallback: Alchemy -> Default RPC
 * @param chainId - EVM chain ID (number) or Solana cluster name (string)
 * @param alchemyApiKey - Optional Alchemy API key
 * @returns RPC endpoint URL
 * @throws Error if no RPC endpoint is available
 */
export function getRpcEndpoint(chainId: number | string, alchemyApiKey?: string): string {
  // Try Alchemy first if API key provided
  if (alchemyApiKey) {
    const alchemyUrl = getAlchemyRpcUrl(chainId, alchemyApiKey)
    if (alchemyUrl) return alchemyUrl
  }

  // Fallback to default RPC from chain metadata
  const metadata = getChainMetadata(chainId)
  if (metadata?.defaultRpcUrl) {
    return metadata.defaultRpcUrl
  }

  throw new Error(`No RPC endpoint available for chain ${chainId}`)
}

/**
 * Check if Alchemy supports a given chain
 * @param chainId - EVM chain ID (number) or Solana cluster name (string)
 * @returns true if Alchemy supports the chain, false otherwise
 */
export function isAlchemySupported(chainId: number | string): boolean {
  const metadata = getChainMetadata(chainId)
  if (!metadata) return false

  if (metadata.chainType === 'evm' && typeof chainId === 'number') {
    return chainId in ALCHEMY_EVM_SLUGS
  }

  if (metadata.chainType === 'solana' && typeof chainId === 'string') {
    return chainId in ALCHEMY_SOLANA_SLUGS
  }

  return false
}
