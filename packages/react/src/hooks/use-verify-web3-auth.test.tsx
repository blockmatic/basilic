import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiProvider } from '../provider'
import { useVerifyWeb3Auth } from './use-verify-web3-auth'

function createMockClient() {
  const verify = vi.fn().mockResolvedValue({
    token: 'access-token',
    refreshToken: 'refresh-token',
  })
  return {
    auth: { web3: { eip155: { verify }, solana: { verify } } },
  } as unknown as ReturnType<typeof import('@repo/core').createClient>
}

function createWrapper(client: ReturnType<typeof createMockClient>, baseUrl = 'https://api.test') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ApiProvider client={client} baseUrl={baseUrl}>
          {children}
        </ApiProvider>
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

  it('fetches verify with callbackUrl and redirects on 302', async () => {
    const client = createMockClient()
    const locationRef = { href: '' }
    Object.defineProperty(window, 'location', {
      value: locationRef,
      writable: true,
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      locationRef.href = 'https://app.com/auth/callback/web3?code=abc'
      return new Response(null, {
        status: 302,
        headers: { Location: 'https://app.com/auth/callback/web3?code=abc' },
      })
    })

    const { result } = renderHook(() => useVerifyWeb3Auth(), {
      wrapper: createWrapper(client),
    })

    await act(async () => {
      await result.current.mutateAsync({
        chain: 'eip155',
        message: 'm',
        signature: 's',
        domain: 'd',
        callbackUrl: 'https://app.com/auth/callback/web3',
      })
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.test/auth/web3/eip155/verify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          message: 'm',
          signature: 's',
          domain: 'd',
          callbackUrl: 'https://app.com/auth/callback/web3',
        }),
        redirect: 'manual',
      }),
    )
    expect(locationRef.href).toBe('https://app.com/auth/callback/web3?code=abc')
    fetchSpy.mockRestore()
  })
})
