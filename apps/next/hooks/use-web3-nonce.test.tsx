import { ReactApiProvider } from '@repo/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useWeb3Nonce } from './use-web3-nonce'

function createMockClient() {
  const nonce = vi.fn().mockResolvedValue({ data: { nonce: 'testnonce' } })
  return {
    auth: { web3: { eip155: { nonce }, solana: { nonce } } },
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
    expect(result.current.data?.nonce).toBe('testnonce')
    expect(client.auth.web3.eip155.nonce).toHaveBeenCalledWith({ query: { address: '0x1234' } })
  })
})
