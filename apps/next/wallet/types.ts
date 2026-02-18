import type { Web3Chain } from '@repo/react'

export type { Web3Chain }

/** Wallet adapter – supplied via WalletProvider (wagmi/Solana adapters) */
export interface WalletAdapter {
  chain: Web3Chain
  address: string | undefined
  signMessage: (message: string | Uint8Array) => Promise<{ signature: string }>
}
