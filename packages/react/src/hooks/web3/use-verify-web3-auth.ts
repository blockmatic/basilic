'use client'

import type { Web3Eip155VerifyResponse, Web3SolanaVerifyResponse } from '@repo/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../../context'
import type { Web3Chain } from '../../types'

export type { Web3Chain }

export type UseVerifyWeb3AuthParams = {
  chain: Web3Chain
  message: string
  signature: string
  domain: string
  /** When set, Fastify returns 302 to callback; browser redirects to complete flow */
  callbackUrl?: string
}

/**
 * Minimal hook: given signed SIWE/SIWS payload, calls the verify endpoint.
 * No wallet adapters, no viem, no message building.
 * When callbackUrl provided: Fastify returns 302, browser follows redirect to callback page.
 * When absent: returns JSON tokens (mobile/CLI).
 */
export function useVerifyWeb3Auth() {
  const { client, baseUrl } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      chain,
      message,
      signature,
      domain,
      callbackUrl,
    }: UseVerifyWeb3AuthParams): Promise<Web3Eip155VerifyResponse | Web3SolanaVerifyResponse> => {
      if (callbackUrl) {
        const { getClientConfig } = await import('@repo/core')
        const url = baseUrl || getClientConfig(client)?.baseUrl || ''
        if (!url?.trim()) throw new Error('baseUrl is required for web3 verification')

        const verifyUrl =
          chain === 'eip155' ? `${url}/auth/web3/eip155/verify` : `${url}/auth/web3/solana/verify`
        const res = await fetch(verifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, signature, domain, callbackUrl }),
          redirect: 'manual',
        })
        if (res.status === 302) {
          const location = res.headers.get('Location')
          if (location) {
            window.location.href = location
            return {} as Web3Eip155VerifyResponse
          }
        }
        const text = await res.text()
        throw new Error(text || `Verify failed: ${res.status}`)
      }

      return chain === 'eip155'
        ? client.auth.web3.eip155.verify({
            body: { message, signature, domain },
            throwOnError: true,
          })
        : client.auth.web3.solana.verify({
            body: { message, signature, domain },
            throwOnError: true,
          })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'jwt'] })
    },
  })
}
