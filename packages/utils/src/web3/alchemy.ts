import { getChainMetadata } from './chain-metadata.js'

// EVM ChainId -> Alchemy network slug mapping
const alchemyEvmSlugs: Record<number, string> = {
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
const alchemySolanaSlugs: Record<string, string> = {
  'mainnet-beta': 'solana-mainnet',
  devnet: 'solana-devnet',
  testnet: 'solana-testnet',
} as const

/**
 * Gets the Alchemy RPC endpoint URL for a given chain ID.
 *
 * Supports EVM chains (Ethereum, Arbitrum, Base, Optimism, Polygon) and
 * Solana clusters (mainnet-beta, devnet, testnet). Returns undefined if
 * the chain is not supported by Alchemy.
 *
 * @param chainId - EVM chain ID (number) or Solana cluster name (string)
 * @param apiKey - Alchemy API key
 * @returns Alchemy RPC URL or undefined if chain not supported by Alchemy
 *
 * @example
 * ```ts
 * const rpcUrl = getAlchemyRpcUrl(1, 'your-api-key')
 * // Returns: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
 *
 * const solanaUrl = getAlchemyRpcUrl('mainnet-beta', 'your-api-key')
 * // Returns: 'https://solana-mainnet.g.alchemy.com/v2/your-api-key'
 * ```
 */
export function getAlchemyRpcUrl(chainId: number | string, apiKey: string): string | undefined {
  const metadata = getChainMetadata(chainId)
  if (!metadata) return undefined

  let slug: string | undefined

  if (metadata.chainType === 'evm' && typeof chainId === 'number') slug = alchemyEvmSlugs[chainId]
  else if (metadata.chainType === 'solana' && typeof chainId === 'string')
    slug = alchemySolanaSlugs[chainId]

  if (!slug) return undefined

  return `https://${slug}.g.alchemy.com/v2/${apiKey}`
}

/**
 * Gets an RPC endpoint URL with fallback strategy: Alchemy -> Default RPC.
 *
 * First attempts to use Alchemy if an API key is provided and the chain is supported.
 * Falls back to the default RPC URL from chain metadata if Alchemy is unavailable.
 *
 * @param chainId - EVM chain ID (number) or Solana cluster name (string)
 * @param alchemyApiKey - Optional Alchemy API key
 * @returns RPC endpoint URL
 * @throws Error if no RPC endpoint is available (chain not supported or no default RPC)
 *
 * @example
 * ```ts
 * // With Alchemy API key (preferred)
 * const rpcUrl = getRpcEndpoint(1, 'your-api-key')
 * // Returns: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
 *
 * // Without Alchemy API key (fallback to default)
 * const defaultUrl = getRpcEndpoint(1)
 * // Returns: 'https://cloudflare-eth.com'
 * ```
 */
export function getRpcEndpoint(chainId: number | string, alchemyApiKey?: string): string {
  // Try Alchemy first if API key provided
  if (alchemyApiKey) {
    const alchemyUrl = getAlchemyRpcUrl(chainId, alchemyApiKey)
    if (alchemyUrl) return alchemyUrl
  }

  // Fallback to default RPC from chain metadata
  const metadata = getChainMetadata(chainId)
  if (metadata?.defaultRpcUrl) return metadata.defaultRpcUrl

  throw new Error(`No RPC endpoint available for chain ${chainId}`)
}

/**
 * Checks if Alchemy supports a given chain.
 *
 * @param chainId - EVM chain ID (number) or Solana cluster name (string)
 * @returns True if Alchemy supports the chain, false otherwise
 *
 * @example
 * ```ts
 * if (isAlchemySupported(chainId)) {
 *   const rpcUrl = getAlchemyRpcUrl(chainId, apiKey)
 * }
 * ```
 */
export function isAlchemySupported(chainId: number | string): boolean {
  const metadata = getChainMetadata(chainId)
  if (!metadata) return false

  if (metadata.chainType === 'evm' && typeof chainId === 'number') return chainId in alchemyEvmSlugs

  if (metadata.chainType === 'solana' && typeof chainId === 'string')
    return chainId in alchemySolanaSlugs

  return false
}
