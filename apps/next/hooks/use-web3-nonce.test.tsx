import { ReactApiProvider } from '@repo/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useWeb3Nonce } from './use-web3-nonce'

function createMockClient() {
  const nonceEip155 = vi.fn().mockResolvedValue({ nonce: 'eip155nonce' })
  const nonceSolana = vi.fn().mockResolvedValue({ nonce: 'solananonce' })
  return {
    auth: { web3: { eip155: { nonce: nonceEip155 }, solana: { nonce: nonceSolana } } },
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
  it('fetches nonce for eip155', async () => {
    const client = createMockClient()
    const { result } = renderHook(() => useWeb3Nonce({ chain: 'eip155', address: '0x1234' }), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(result.current.data?.nonce).toBe('eip155nonce')
    expect(client.auth.web3.eip155.nonce).toHaveBeenCalledWith({ query: { address: '0x1234' } })
    expect(client.auth.web3.solana.nonce).not.toHaveBeenCalled()
  })

  it('fetches nonce for solana with evm-style address', async () => {
    const client = createMockClient()
    const { result } = renderHook(() => useWeb3Nonce({ chain: 'solana', address: '0x1234' }), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(result.current.data?.nonce).toBe('solananonce')
    expect(client.auth.web3.solana.nonce).toHaveBeenCalledWith({ query: { address: '0x1234' } })
    expect(client.auth.web3.eip155.nonce).not.toHaveBeenCalled()
  })

  it('does not fetch when address is undefined', async () => {
    const client = createMockClient()
    const { result } = renderHook(() => useWeb3Nonce({ chain: 'eip155', address: undefined }), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.fetchStatus).toBeDefined())
    expect(client.auth.web3.eip155.nonce).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })

  it('does not fetch when enabled is false', async () => {
    const client = createMockClient()
    const { result } = renderHook(
      () => useWeb3Nonce({ chain: 'eip155', address: '0x1234', enabled: false }),
      { wrapper: createWrapper(client) },
    )

    await waitFor(() => expect(result.current.fetchStatus).toBeDefined())
    expect(client.auth.web3.eip155.nonce).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })
})
