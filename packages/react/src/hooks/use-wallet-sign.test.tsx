import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ReactApiProvider } from '../provider'
import { WalletProvider } from '../wallet/context'
import type { WalletAdapter } from '../wallet/types'
import { useWalletSign } from './use-wallet-sign'

const mockAdapter: WalletAdapter = {
  chain: 'eip155',
  address: '0x1234567890123456789012345678901234567890',
  signMessage: vi.fn().mockResolvedValue({ signature: '0xsig' }),
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const user = vi.fn().mockResolvedValue({
    user: {
      id: 'u1',
      email: null,
      wallet: { chain: 'eip155', address: '0x1234567890123456789012345678901234567890' },
      linkedWallets: [],
    },
  })
  const client = {
    auth: { session: { user } },
  } as unknown as ReturnType<typeof import('@repo/core').createClient>

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ReactApiProvider client={client}>
          <WalletProvider adapters={{ eip155: mockAdapter }}>{children}</WalletProvider>
        </ReactApiProvider>
      </QueryClientProvider>
    )
  }
}

describe('useWalletSign', () => {
  it('returns isReady when adapter matches session wallet', async () => {
    const { result } = renderHook(() => useWalletSign('eip155'), {
      wrapper: createWrapper(),
    })

    expect(result.current.adapter).toBeDefined()
    expect(result.current.isWalletRejection(new Error('User denied'))).toBe(true)
  })
})
