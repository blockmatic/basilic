import { ReactApiProvider } from '@repo/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { WalletProvider } from '@/wallet/context'
import type { WalletAdapter } from '@/wallet/types'
import { useWallet } from './use-wallet'

const mockEvmAdapter: WalletAdapter = {
  chain: 'eip155',
  address: '0x1234567890123456789012345678901234567890',
  signMessage: async () => ({ signature: 'sig' }),
}

const mockSolanaAdapter: WalletAdapter = {
  chain: 'solana',
  address: 'SolanaAddress123',
  signMessage: async () => ({ signature: 'sig' }),
}

const mockClient = {} as ReturnType<typeof import('@repo/core').createClient>

function createWrapper(adapters: { eip155?: WalletAdapter; solana?: WalletAdapter }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ReactApiProvider client={mockClient}>
          <WalletProvider adapters={adapters}>{children}</WalletProvider>
        </ReactApiProvider>
      </QueryClientProvider>
    )
  }
}

describe('useWallet', () => {
  it('returns undefined when no WalletProvider', () => {
    const queryClient = new QueryClient()
    const { result } = renderHook(() => useWallet(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <ReactApiProvider client={mockClient}>{children}</ReactApiProvider>
        </QueryClientProvider>
      ),
    })
    expect(result.current).toBeUndefined()
  })

  it('returns eip155 adapter when chain is eip155', () => {
    const { result } = renderHook(() => useWallet('eip155'), {
      wrapper: createWrapper({ eip155: mockEvmAdapter }),
    })
    expect(result.current).toEqual(mockEvmAdapter)
  })

  it('returns solana adapter when chain is solana', () => {
    const { result } = renderHook(() => useWallet('solana'), {
      wrapper: createWrapper({ solana: mockSolanaAdapter }),
    })
    expect(result.current).toEqual(mockSolanaAdapter)
  })

  it('returns first available adapter when chain omitted', () => {
    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper({ eip155: mockEvmAdapter, solana: mockSolanaAdapter }),
    })
    expect(result.current).toEqual(mockEvmAdapter)
  })

  it('returns undefined when requested chain is not registered', () => {
    const { result } = renderHook(() => useWallet('solana'), {
      wrapper: createWrapper({ eip155: mockEvmAdapter }),
    })
    expect(result.current).toBeUndefined()
  })
})
