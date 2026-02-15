import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'
import type { Web3Chain } from '../wallet/types'

export type { Web3Chain }

export type Web3NonceResponse = { nonce: string }

/**
 * Fetches nonce for Web3 sign-in (SIWE or SIWS).
 * Uses TanStack Query; enables prefetch when wallet connects.
 *
 * @param chain - 'eip155' for SIWE, 'solana' for SIWS
 * @param address - Wallet address (validated by API)
 * @param options - Query options (enabled, etc.)
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

  const fetcher = async (): Promise<Web3NonceResponse> => {
    if (!address) throw new Error('Address required')
    const res =
      chain === 'eip155'
        ? await client.auth.web3.eip155.nonce({ query: { address } })
        : await client.auth.web3.solana.nonce({ query: { address } })
    const data =
      res && typeof res === 'object' && 'data' in res
        ? (res as { data: Web3NonceResponse }).data
        : res
    return data as Web3NonceResponse
  }

  return useQuery({
    queryKey: ['web3', 'nonce', chain, address] as const,
    queryFn: fetcher,
    enabled: enabled && !!address,
    ...queryClientDefaults,
  })
}
