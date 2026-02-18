'use client'

import { useVerifyLinkWallet } from '@repo/react'
import { useMutation } from '@tanstack/react-query'
import { buildAndSignMessage } from '@/lib/web3-sign-flow'
import { isWalletRejection } from '@/lib/web3-sign-utils'
import type { Web3Chain } from '@/wallet/types'
import { useWeb3Nonce } from './use-web3-nonce'

export type UseLinkWalletParams = {
  chain: Web3Chain
  address: string | undefined
  signMessage: (message: string | Uint8Array) => Promise<{ signature: string }>
  domain?: string
  statement?: string
  chainId?: number
  network?: string
}

export type UseLinkWalletResult = {
  linkWallet: () => Promise<void>
  isPending: boolean
  error: Error | null
  isWalletRejection: boolean
}

/**
 * Links a wallet to the current authenticated user.
 * Builds message → signs → calls useVerifyLinkWallet.
 */
export function useLinkWallet({
  chain,
  address,
  signMessage,
  domain = typeof window !== 'undefined' ? window.location.host : '',
  statement = 'Link wallet to your account',
  chainId = 1,
  network = 'mainnet-beta',
}: UseLinkWalletParams): UseLinkWalletResult {
  const { mutateAsync } = useVerifyLinkWallet()

  const { data: nonceData, refetch: refetchNonce } = useWeb3Nonce({
    chain,
    address,
    enabled: !!address,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('No wallet address')
      if (!signMessage) throw new Error('No signMessage function')

      let nonce = nonceData?.nonce
      if (!nonce) {
        const { data } = await refetchNonce()
        nonce = data?.nonce
        if (!nonce) throw new Error('Failed to get nonce')
      }

      const uri = typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
      const { message, signature } = await buildAndSignMessage({
        chain,
        address,
        signMessage,
        nonce,
        domain,
        statement,
        uri,
        chainId,
        network,
      })
      await mutateAsync({ chain, message, signature })
    },
  })

  const linkWallet = async () => {
    try {
      await mutation.mutateAsync()
    } catch {
      /* Error stored in mutation.error */
    }
  }

  const err = mutation.error as Error | null
  return {
    linkWallet,
    isPending: mutation.isPending,
    error: err ?? null,
    isWalletRejection: err ? isWalletRejection(err) : false,
  }
}
