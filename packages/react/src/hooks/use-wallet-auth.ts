'use client'

import type { Web3Eip155VerifyResponse, Web3SolanaVerifyResponse } from '@repo/core'
import { useCallback, useState } from 'react'
import { createSiweMessage } from 'viem/siwe'
import { useReactApiConfig } from '../context'
import type { Web3Chain } from './use-web3-nonce'
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
}: {
  domain: string
  address: string
  nonce: string
  statement?: string
  uri?: string
}) {
  return `${domain} wants you to sign in with your Solana account:\n${address}\n\n${statement}\n\nURI: ${uri}\nVersion: 1\nChain ID: mainnet-beta\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
}

export type UseWalletAuthParams = {
  chain: Web3Chain
  address: string | undefined
  signMessage: (message: string | Uint8Array) => Promise<{ signature: string }>
  domain?: string
  statement?: string
}

export type UseWalletAuthResult = {
  signIn: () => Promise<void>
  isPending: boolean
  error: Error | null
}

/**
 * Primary hook for Web3 sign-in (SIWE or SIWS).
 * Composes useWeb3Nonce; builds message, signs, verifies, optionally posts to authCallbackUrl.
 */
export function useWalletAuth({
  chain,
  address,
  signMessage,
  domain = typeof window !== 'undefined' ? window.location.host : '',
  statement = 'Sign in to the application',
}: UseWalletAuthParams): UseWalletAuthResult {
  const { client, authCallbackUrl } = useReactApiConfig()
  const { data: nonceData, refetch: refetchNonce } = useWeb3Nonce({
    chain,
    address,
    enabled: !!address,
  })

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signIn = useCallback(async () => {
    if (!address) {
      setError(new Error('No wallet address'))
      return
    }

    let nonce = nonceData?.nonce
    if (!nonce) {
      const { data } = await refetchNonce()
      nonce = data?.nonce
      if (!nonce) {
        setError(new Error('Failed to get nonce'))
        return
      }
    }

    setError(null)
    setIsPending(true)

    try {
      const uri = typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
      let message: string
      let signature: string

      if (chain === 'eip155') {
        message = createSiweMessage({
          address: address as `0x${string}`,
          chainId: 1,
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
    } catch (err) {
      if (isWalletRejection(err)) {
        setError(new Error('User rejected signing'))
      } else {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
      throw err
    } finally {
      setIsPending(false)
    }
  }, [
    address,
    nonceData?.nonce,
    refetchNonce,
    chain,
    signMessage,
    domain,
    statement,
    client,
    authCallbackUrl,
  ])

  return { signIn, isPending, error }
}
