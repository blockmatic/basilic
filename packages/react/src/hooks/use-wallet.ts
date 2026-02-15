'use client'

import { useWalletContext } from '../wallet/context'
import type { WalletAdapter, Web3Chain } from '../wallet/types'

/**
 * Returns wallet adapter for the given chain from WalletProvider context.
 * Session wallet enforcement is handled by useUser in consuming hooks.
 *
 * @param chain - 'eip155' or 'solana'. If omitted, returns first available adapter.
 * @returns Adapter if WalletProvider supplies one for the chain, otherwise undefined
 */
export function useWallet(chain?: Web3Chain): WalletAdapter | undefined {
  const ctx = useWalletContext()
  if (!ctx) return undefined

  if (chain) return ctx.adapters[chain === 'eip155' ? 'eip155' : 'solana']
  return ctx.adapters.eip155 ?? ctx.adapters.solana
}
