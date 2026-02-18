'use client'

import { createContext, useContext } from 'react'
import type { WalletAdapter } from './types'

export type WalletContextValue = {
  adapters: { eip155?: WalletAdapter; solana?: WalletAdapter }
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({
  adapters = {},
  children,
}: {
  adapters?: { eip155?: WalletAdapter; solana?: WalletAdapter }
  children: React.ReactNode
}) {
  return <WalletContext.Provider value={{ adapters }}>{children}</WalletContext.Provider>
}

export function useWalletContext(): WalletContextValue | null {
  return useContext(WalletContext)
}
