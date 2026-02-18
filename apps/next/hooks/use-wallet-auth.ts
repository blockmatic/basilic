'use client'

import { useVerifyWeb3Auth } from '@repo/react'
import { useMutation } from '@tanstack/react-query'
import { buildAndSignMessage } from '@/lib/web3-sign-flow'
import { isWalletRejection } from '@/lib/web3-sign-utils'
import type { WalletAdapter, Web3Chain } from '@/wallet/types'
import { useWeb3Nonce } from './use-web3-nonce'

export type UseWalletAuthParams = {
  adapter?: WalletAdapter
  chain?: Web3Chain
  address?: string | undefined
  signMessage?: (message: string | Uint8Array) => Promise<{ signature: string }>
  domain?: string
  statement?: string
  chainId?: number
  network?: string
}

export type UseWalletAuthResult = {
  signIn: () => Promise<void>
  isPending: boolean
  error: Error | null
}

/**
 * Primary hook for Web3 sign-in (SIWE or SIWS).
 * Builds message → signs via adapter → calls useVerifyWeb3Auth.
 */
export function useWalletAuth({
  adapter,
  chain: explicitChain,
  address: explicitAddress,
  signMessage: explicitSignMessage,
  domain = typeof window !== 'undefined' ? window.location.host : '',
  statement = 'Sign in to the application',
  chainId = 1,
  network = 'mainnet-beta',
}: UseWalletAuthParams): UseWalletAuthResult {
  const { mutateAsync } = useVerifyWeb3Auth()

  const chain = adapter?.chain ?? explicitChain
  const address = adapter?.address ?? explicitAddress
  const signMessage = adapter?.signMessage ?? explicitSignMessage

  const { data: nonceData, refetch: refetchNonce } = useWeb3Nonce({
    chain: (chain ?? 'eip155') as Web3Chain,
    address,
    enabled: !!chain && !!address,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('No wallet address')
      if (!signMessage) throw new Error('No signMessage function')
      if (!chain) throw new Error('No chain configured')

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
      await mutateAsync({ chain, message, signature, domain })
    },
  })

  const signIn = async () => {
    try {
      await mutation.mutateAsync()
    } catch {
      /* Error stored in mutation.error */
    }
  }

  const error =
    mutation.error && isWalletRejection(mutation.error)
      ? new Error('User rejected signing')
      : (mutation.error as Error | null)

  return { signIn, isPending: mutation.isPending, error: error ?? null }
}
