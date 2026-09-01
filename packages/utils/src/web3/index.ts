import { getChainMetadata } from './chain-metadata.js'
import type { ChainType } from './chain-type.js'

export * from './alchemy.js'
export { type ChainMetadata, getChainMetadata } from './chain-metadata.js'
export { chainTypeSchema } from './chain-type.js'
export type { ChainType }

/** SIWE/SIWS chain identifier: eip155 for EVM, solana for Solana */
export type Web3Chain = 'eip155' | 'solana'

/** Maps ChainType to Web3Chain for SIWE/SIWS auth. evm → eip155, solana → solana */
export function getWeb3Chain(chainType: ChainType): Web3Chain | undefined {
  if (chainType === 'evm') return 'eip155'
  if (chainType === 'solana') return 'solana'
  return undefined
}

/**
 * Gets the chain type from a chain ID.
 */
export function getChainType(chainId: number | string): ChainType | undefined {
  const metadata = getChainMetadata(chainId)
  return metadata?.chainType
}

const sliceLen = 8

/** Short display format for wallet address (chain:address or chain:first8chars… when long) */
export function formatWalletShort({ chain, address }: { chain: string; address: string }): string {
  const suffix = address.length > sliceLen ? `${address.slice(0, sliceLen)}…` : address
  return `${chain}:${suffix}`
}
