'use client'

import { useWalletContext } from '@/wallet/context'
import type { WalletAdapter, Web3Chain } from '@/wallet/types'

/**
 * Returns wallet adapter for the given chain from WalletProvider context.
 *
 * @param chain - 'eip155' or 'solana'. If omitted, returns first available adapter.
 */
export function useWallet(chain?: Web3Chain): WalletAdapter | undefined {
  const ctx = useWalletContext()
  if (!ctx) return undefined

  if (chain) return ctx.adapters[chain]
  return ctx.adapters.eip155 ?? ctx.adapters.solana
}
