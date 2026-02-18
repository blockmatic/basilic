import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ReactApiProvider } from '../provider'
import { useVerifyWeb3Auth } from './use-verify-web3-auth'

function createMockClient() {
  const verify = vi.fn().mockResolvedValue({
    data: { token: 'access-token', refreshToken: 'refresh-token' },
  })
  return {
    auth: { web3: { eip155: { verify }, solana: { verify } } },
  } as unknown as ReturnType<typeof import('@repo/core').createClient>
}

function createWrapper(client: ReturnType<typeof createMockClient>, authCallbackUrl?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ReactApiProvider client={client} authCallbackUrl={authCallbackUrl}>
          {children}
        </ReactApiProvider>
      </QueryClientProvider>
    )
  }
}

describe('useVerifyWeb3Auth', () => {
  it('calls eip155 verify with message, signature, domain', async () => {
    const client = createMockClient()
    const { result } = renderHook(() => useVerifyWeb3Auth(), {
      wrapper: createWrapper(client),
    })

    await act(async () => {
      await result.current.mutateAsync({
        chain: 'eip155',
        message: 'test message',
        signature: '0xsig',
        domain: 'localhost',
      })
    })

    expect(client.auth.web3.eip155.verify).toHaveBeenCalledWith({
      body: { message: 'test message', signature: '0xsig', domain: 'localhost' },
      throwOnError: true,
    })
  })

  it('calls solana verify when chain is solana', async () => {
    const client = createMockClient()
    const { result } = renderHook(() => useVerifyWeb3Auth(), {
      wrapper: createWrapper(client),
    })

    await act(async () => {
      await result.current.mutateAsync({
        chain: 'solana',
        message: 'test message',
        signature: 'sig',
        domain: 'localhost',
      })
    })

    expect(client.auth.web3.solana.verify).toHaveBeenCalledWith({
      body: { message: 'test message', signature: 'sig', domain: 'localhost' },
      throwOnError: true,
    })
  })

  it('POSTs tokens to authCallbackUrl when set', async () => {
    const client = createMockClient()
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }))

    const { result } = renderHook(() => useVerifyWeb3Auth(), {
      wrapper: createWrapper(client, '/api/auth/callback'),
    })

    await act(async () => {
      await result.current.mutateAsync({
        chain: 'eip155',
        message: 'm',
        signature: 's',
        domain: 'd',
      })
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/callback',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'access-token', refreshToken: 'refresh-token' }),
        credentials: 'include',
        redirect: 'follow',
      }),
    )
    fetchSpy.mockRestore()
  })
})
