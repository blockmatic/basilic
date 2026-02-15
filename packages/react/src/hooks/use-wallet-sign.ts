'use client'

import type { Web3Chain } from '../wallet/types'
import { useUser } from './use-user'
import { useWallet } from './use-wallet'

const REJECTION_PATTERNS = [/denied/i, /rejected/i, /cancel/i, /user denied/i, /user rejected/i]

function isWalletRejectionError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return REJECTION_PATTERNS.some(p => p.test(msg))
}

export type UseWalletSignParams = {
  chain?: Web3Chain
}

export type UseWalletSignResult = {
  sign: (message: string | Uint8Array) => Promise<{ signature: string } | null>
  isReady: boolean
  isWalletRejection: (error: unknown) => boolean
  adapter: ReturnType<typeof useWallet>
}

/**
 * Signs arbitrary messages via wallet adapter.
 * isReady when adapter exists and (if session has wallet) connected wallet matches session wallet.
 */
export function useWalletSign(chain?: Web3Chain): UseWalletSignResult {
  const adapter = useWallet(chain)
  const { data: userData } = useUser()

  const sessionWallet = userData?.user?.wallet
  const walletMatchesSession =
    !sessionWallet ||
    (sessionWallet.chain === adapter?.chain &&
      sessionWallet.address.toLowerCase() === adapter?.address?.toLowerCase())

  const isReady = !!adapter?.address && adapter.signMessage != null && walletMatchesSession

  const sign = async (message: string | Uint8Array) => {
    if (!adapter?.signMessage) return null
    try {
      return await adapter.signMessage(message)
    } catch {
      return null
    }
  }

  return {
    sign,
    isReady,
    isWalletRejection: isWalletRejectionError,
    adapter,
  }
}
