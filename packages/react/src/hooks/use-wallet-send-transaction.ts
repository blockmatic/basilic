'use client'

import type { EvmTxParams, SolanaTxParams, Web3Chain } from '../wallet/types'
import { useUser } from './use-user'
import { useWallet } from './use-wallet'

const REJECTION_PATTERNS = [/denied/i, /rejected/i, /cancel/i, /user denied/i, /user rejected/i]

function isWalletRejectionError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return REJECTION_PATTERNS.some(p => p.test(msg))
}

export type UseWalletSendTransactionParams = {
  chain?: Web3Chain
}

export type UseWalletSendTransactionResult = {
  sendTransaction: (params: EvmTxParams | SolanaTxParams) => Promise<{ hash: string } | null>
  isReady: boolean
  isWalletRejection: (error: unknown) => boolean
  adapter: ReturnType<typeof useWallet>
}

/**
 * Sends on-chain transactions via wallet adapter.
 * isReady when adapter has sendTransaction and (if session has wallet) connected wallet matches session wallet.
 */
export function useWalletSendTransaction(chain?: Web3Chain): UseWalletSendTransactionResult {
  const adapter = useWallet(chain)
  const { data: userData } = useUser()

  const sessionWallet = userData?.user?.wallet
  const walletMatchesSession =
    !sessionWallet ||
    (sessionWallet.chain === adapter?.chain &&
      sessionWallet.address.toLowerCase() === adapter?.address?.toLowerCase())

  const isReady = !!adapter?.address && !!adapter?.sendTransaction && walletMatchesSession

  const sendTransaction = async (
    params: EvmTxParams | SolanaTxParams,
  ): Promise<{ hash: string } | null> => {
    if (!adapter?.sendTransaction) return null
    try {
      return await adapter.sendTransaction(params)
    } catch {
      return null
    }
  }

  return {
    sendTransaction,
    isReady,
    isWalletRejection: isWalletRejectionError,
    adapter,
  }
}
