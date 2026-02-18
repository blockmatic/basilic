'use client'

import { useVerifyLinkWallet } from '@repo/react'
import { useMutation } from '@tanstack/react-query'
import { createSiweMessage } from 'viem/siwe'
import type { Web3Chain } from '@/wallet/types'
import { useWeb3Nonce } from './use-web3-nonce'

const REJECTION_PATTERNS = [/denied/i, /rejected/i, /cancel/i, /user denied/i, /user rejected/i]

function isWalletRejection(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return REJECTION_PATTERNS.some(p => p.test(msg))
}

function buildSiwsMessage({
  domain,
  address,
  nonce,
  statement = 'Link wallet to your account',
  uri = 'https://localhost',
  chainId = 'mainnet-beta',
}: {
  domain: string
  address: string
  nonce: string
  statement?: string
  uri?: string
  chainId?: string
}) {
  return `${domain} wants you to sign in with your Solana account:\n${address}\n\n${statement}\n\nURI: ${uri}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
}

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
      if (!address || !signMessage) {
        throw new Error('No wallet address')
      }

      let nonce = nonceData?.nonce
      if (!nonce) {
        const { data } = await refetchNonce()
        nonce = data?.nonce
        if (!nonce) throw new Error('Failed to get nonce')
      }

      const uri = typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
      let message: string
      let signature: string

      if (chain === 'eip155') {
        message = createSiweMessage({
          address: address as `0x${string}`,
          chainId,
          domain,
          nonce,
          uri,
          version: '1',
          statement,
        })
        const result = await signMessage(message)
        signature = result.signature
      } else {
        message = buildSiwsMessage({
          domain,
          address,
          nonce,
          statement,
          uri,
          chainId: network,
        })
        const result = await signMessage(message)
        signature = result.signature
      }

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
