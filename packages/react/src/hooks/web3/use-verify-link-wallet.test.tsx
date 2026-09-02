import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiProvider } from '../../provider'
import { useVerifyLinkWallet } from './use-verify-link-wallet'

function createMockClient() {
  const verify = vi.fn().mockResolvedValue(undefined)
  return {
    account: { link: { wallet: { verify } } },
  } as unknown as ReturnType<typeof import('@repo/core').createClient>
}

function createWrapper(client: ReturnType<typeof createMockClient>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ApiProvider client={client}>{children}</ApiProvider>
      </QueryClientProvider>
    )
  }
}

describe('useVerifyLinkWallet', () => {
  it('calls verify with chain, message, signature', async () => {
    const client = createMockClient()
    const { result } = renderHook(() => useVerifyLinkWallet(), {
      wrapper: createWrapper(client),
    })

    await act(async () => {
      await result.current.mutateAsync({
        chain: 'eip155',
        message: 'test message',
        signature: '0xsig',
      })
    })

    expect(client.account.link.wallet.verify).toHaveBeenCalledWith({
      body: { chain: 'eip155', message: 'test message', signature: '0xsig' },
      throwOnError: true,
    })
  })

  it('calls verify with solana chain', async () => {
    const client = createMockClient()
    const { result } = renderHook(() => useVerifyLinkWallet(), {
      wrapper: createWrapper(client),
    })

    await act(async () => {
      await result.current.mutateAsync({
        chain: 'solana',
        message: 'solana msg',
        signature: 'sig',
      })
    })

    expect(client.account.link.wallet.verify).toHaveBeenCalledWith({
      body: { chain: 'solana', message: 'solana msg', signature: 'sig' },
      throwOnError: true,
    })
  })
})
