'use client'

import type { Web3Eip155VerifyResponse, Web3SolanaVerifyResponse } from '@repo/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSiweMessage } from 'viem/siwe'
import { useReactApiConfig } from '../context'
import type { WalletAdapter, Web3Chain } from '../wallet/types'
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
  statement = 'Sign in to the application',
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

export type UseWalletAuthParams = {
  /** Adapter from useWallet; when set, chain/address/signMessage are derived */
  adapter?: WalletAdapter
  /** Chain when not using adapter */
  chain?: Web3Chain
  /** Address when not using adapter */
  address?: string | undefined
  /** Sign function when not using adapter */
  signMessage?: (message: string | Uint8Array) => Promise<{ signature: string }>
  domain?: string
  statement?: string
  /** EVM chainId for SIWE (e.g. from useChainId). Required when chain is eip155. */
  chainId?: number
  /** Solana network for SIWS Chain ID (e.g. mainnet-beta, devnet, testnet). Default mainnet-beta. */
  network?: string
}

export type UseWalletAuthResult = {
  signIn: () => Promise<void>
  isPending: boolean
  error: Error | null
}

/**
 * Primary hook for Web3 sign-in (SIWE or SIWS).
 * Uses useMutation; supports adapter or explicit chain/address/signMessage.
 * SIWE uses dynamic chainId from wagmi when chain is eip155.
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
  const { client, authCallbackUrl } = useReactApiConfig()
  const queryClient = useQueryClient()

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
      if (!address || !signMessage || !chain) {
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

      const verifyResult =
        chain === 'eip155'
          ? ((await client.auth.web3.eip155.verify({
              body: { message, signature, domain },
              throwOnError: true,
            })) as unknown as Web3Eip155VerifyResponse)
          : ((await client.auth.web3.solana.verify({
              body: { message, signature, domain },
              throwOnError: true,
            })) as unknown as Web3SolanaVerifyResponse)

      if (authCallbackUrl) {
        const res = await fetch(authCallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: verifyResult.token,
            refreshToken: verifyResult.refreshToken,
          }),
          credentials: 'include',
          redirect: 'follow',
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Callback failed: ${res.status}`)
        }
        if (res.redirected) {
          window.location.href = res.url
          return
        }
      }

      return verifyResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
    },
  })

  const signIn = async () => {
    try {
      await mutation.mutateAsync()
    } catch {
      /* Error stored in mutation.error, surfaced via result.error */
    }
  }

  const error =
    mutation.error && isWalletRejection(mutation.error)
      ? new Error('User rejected signing')
      : (mutation.error as Error | null)

  return { signIn, isPending: mutation.isPending, error: error ?? null }
}
