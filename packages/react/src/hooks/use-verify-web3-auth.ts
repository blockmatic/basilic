'use client'

import type { Web3Eip155VerifyResponse, Web3SolanaVerifyResponse } from '@repo/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

export type Web3Chain = 'eip155' | 'solana'

export type UseVerifyWeb3AuthParams = {
  chain: Web3Chain
  message: string
  signature: string
  domain: string
}

/**
 * Minimal hook: given signed SIWE/SIWS payload, calls the verify endpoint.
 * No wallet adapters, no viem, no message building.
 * If authCallbackUrl is set, POSTs tokens and follows redirect.
 */
export function useVerifyWeb3Auth() {
  const { client, authCallbackUrl } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      chain,
      message,
      signature,
      domain,
    }: UseVerifyWeb3AuthParams): Promise<Web3Eip155VerifyResponse | Web3SolanaVerifyResponse> => {
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
          return verifyResult
        }
      }

      return verifyResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
    },
  })
}
