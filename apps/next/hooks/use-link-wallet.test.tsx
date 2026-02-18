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

  it('calls verify with solana chain and SIWS message', async () => {
    const client = createMockClient()
    const signMessage = vi.fn().mockResolvedValue({ signature: 'solsig123' })
    const { result } = renderHook(
      () =>
        useLinkWallet({
          chain: 'solana',
          address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          signMessage,
          domain: 'localhost',
          network: 'mainnet-beta',
        }),
      { wrapper: createWrapper(client) },
    )

    await waitFor(() => expect(result.current).toBeDefined())
    await act(async () => {
      await result.current.linkWallet()
    })

    expect(signMessage).toHaveBeenCalled()
    const verifyMock = client.account.link.wallet.verify as ReturnType<typeof vi.fn>
    const verifyCall = verifyMock.mock.calls[0]?.[0] as {
      body: { chain: string; message: string; signature: string }
      throwOnError: boolean
    }
    expect(verifyCall).toBeDefined()
    expect(verifyCall?.body).toMatchObject({ chain: 'solana', signature: 'solsig123' })
    expect(verifyCall?.body?.message).toContain('sign in with your Solana account')
    expect(verifyCall?.throwOnError).toBe(true)
  })
})
