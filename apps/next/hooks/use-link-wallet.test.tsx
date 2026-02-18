import { ReactApiProvider } from '@repo/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useLinkWallet } from './use-link-wallet'

function createMockClient() {
  const verify = vi.fn().mockResolvedValue(undefined)
  const nonce = vi.fn().mockResolvedValue({ data: { nonce: 'linknonce123' } })
  return {
    account: { link: { wallet: { verify } } },
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

describe('useLinkWallet', () => {
  it('calls verify with chain, message, signature after signing', async () => {
    const client = createMockClient()
    const signMessage = vi.fn().mockResolvedValue({ signature: '0xsig' })
    const { result } = renderHook(
      () =>
        useLinkWallet({
          chain: 'eip155',
          address: '0x1234567890123456789012345678901234567890',
          signMessage,
          domain: 'localhost',
        }),
      { wrapper: createWrapper(client) },
    )

    await waitFor(() => expect(result.current).toBeDefined())
    await act(async () => {
      await result.current.linkWallet()
    })

    expect(signMessage).toHaveBeenCalled()
    expect(client.account.link.wallet.verify).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          chain: 'eip155',
          message: expect.any(String),
          signature: '0xsig',
        }),
        throwOnError: true,
      }),
    )
  })
})
