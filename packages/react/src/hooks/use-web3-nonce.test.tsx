import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ReactApiProvider } from '../provider'
import { useWeb3Nonce } from './use-web3-nonce'

function createMockClient(nonceResponse: { nonce: string }) {
  return {
    auth: {
      web3: {
        eip155: {
          nonce: vi.fn().mockResolvedValue({ data: nonceResponse }),
        },
        solana: {
          nonce: vi.fn().mockResolvedValue({ data: nonceResponse }),
        },
      },
    },
  } as unknown as ReturnType<typeof import('@repo/core').createClient>
}

function createWrapper(client: ReturnType<typeof createMockClient>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ReactApiProvider client={client}>{children}</ReactApiProvider>
      </QueryClientProvider>
    )
  }
}

describe('useWeb3Nonce', () => {
  it('fetches nonce for eip155 when enabled and address provided', async () => {
    const nonce = 'abc123'
    const client = createMockClient({ nonce })
    const { result } = renderHook(() => useWeb3Nonce({ chain: 'eip155', address: '0x1234' }), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.nonce).toBe(nonce)
    expect(client.auth.web3.eip155.nonce).toHaveBeenCalledWith({ query: { address: '0x1234' } })
    expect(client.auth.web3.solana.nonce).not.toHaveBeenCalled()
  })

  it('fetches nonce for solana when enabled and address provided', async () => {
    const nonce = 'xyz789'
    const client = createMockClient({ nonce })
    const { result } = renderHook(
      () =>
        useWeb3Nonce({
          chain: 'solana',
          address: 'So11111111111111111111111111111111111111112',
        }),
      { wrapper: createWrapper(client) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.nonce).toBe(nonce)
    expect(client.auth.web3.solana.nonce).toHaveBeenCalledWith({
      query: { address: 'So11111111111111111111111111111111111111112' },
    })
    expect(client.auth.web3.eip155.nonce).not.toHaveBeenCalled()
  })

  it('does not fetch when address is undefined', async () => {
    const client = createMockClient({ nonce: 'nope' })
    const { result } = renderHook(() => useWeb3Nonce({ chain: 'eip155', address: undefined }), {
      wrapper: createWrapper(client),
    })

    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(client.auth.web3.eip155.nonce).not.toHaveBeenCalled()
  })

  it('does not fetch when enabled is false', async () => {
    const client = createMockClient({ nonce: 'nope' })
    const { result } = renderHook(
      () => useWeb3Nonce({ chain: 'eip155', address: '0x1234', enabled: false }),
      { wrapper: createWrapper(client) },
    )

    expect(result.current.isFetching).toBe(false)
    expect(client.auth.web3.eip155.nonce).not.toHaveBeenCalled()
  })
})
