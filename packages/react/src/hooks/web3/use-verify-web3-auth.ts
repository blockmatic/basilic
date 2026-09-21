'use client'

import type { Web3Eip155VerifyResponse, Web3SolanaVerifyResponse } from '@repo/core'
import { ApiError } from '@repo/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../../context'
import type { Web3Chain } from '../../types'

export type { Web3Chain }

export type UseVerifyWeb3AuthParams = {
  chain: Web3Chain
  message: string
  signature: string
  domain: string
  callbackUrl?: string
}

function throwVerifyFailure({ status, text }: { status: number; text: string }): never {
  let body: unknown
  try {
    body = JSON.parse(text) as unknown
  } catch {
    body = { message: text }
  }
  const message =
    body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message
      : text || `Verify failed: ${status}`
  throw new ApiError(status, message, body)
}

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
        throwVerifyFailure({ status: res.status, text: await res.text() })
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
