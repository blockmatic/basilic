'use client'

import type { Web3Eip155NonceResponse, Web3SolanaNonceResponse } from '@repo/core'
import { useReactApiConfig } from '@repo/react'
import type { Web3Chain } from '@repo/utils/web3'
import { useQuery } from '@tanstack/react-query'

/**
 * Fetches nonce for Web3 sign-in (SIWE or SIWS).
 * Uses TanStack Query; enables prefetch when wallet connects.
 */
export function useWeb3Nonce({
  chain,
  address,
  enabled = true,
}: {
  chain: Web3Chain
  address: string | undefined
  enabled?: boolean
}) {
  const { client, queryClientDefaults } = useReactApiConfig()

  const fetcher = async (): Promise<Web3Eip155NonceResponse | Web3SolanaNonceResponse> => {
    if (!address) throw new Error('Address required')
    return chain === 'eip155'
      ? client.auth.web3.eip155.nonce({ query: { address } })
      : client.auth.web3.solana.nonce({ query: { address } })
  }

  return useQuery({
    queryKey: ['web3', 'nonce', chain, address] as const,
    queryFn: fetcher,
    enabled: enabled && !!address,
    ...queryClientDefaults,
  })
}
