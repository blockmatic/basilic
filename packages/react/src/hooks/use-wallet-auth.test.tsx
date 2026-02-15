import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ReactApiProvider } from '../provider'
import { useWalletAuth } from './use-wallet-auth'

function createMockClient() {
  const verify = vi.fn().mockResolvedValue({
    token: 'access-token',
    refreshToken: 'refresh-token',
  })
  const nonce = vi.fn().mockResolvedValue({ data: { nonce: 'testnonce12345' } })
  return {
    auth: {
      web3: {
        eip155: { nonce, verify },
        solana: { nonce, verify },
      },
    },
  } as unknown as ReturnType<typeof import('@repo/core').createClient>
}

function createWrapper(client: ReturnType<typeof createMockClient>, authCallbackUrl?: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
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

describe('useWalletAuth', () => {
  it('calls signIn, signs message, verifies eip155, and returns without callback when authCallbackUrl not set', async () => {
    const client = createMockClient()
    const signMessage = vi.fn().mockResolvedValue({ signature: '0xsig' })
    const { result } = renderHook(
      () =>
        useWalletAuth({
          chain: 'eip155',
          address: '0x1234567890123456789012345678901234567890',
          signMessage,
          domain: 'localhost',
        }),
      { wrapper: createWrapper(client) },
    )

    await waitFor(() => expect(result.current).toBeDefined())
    await act(async () => {
      await result.current.signIn()
    })

    expect(signMessage).toHaveBeenCalled()
    const msg = signMessage.mock.calls[0]?.[0] as string
    expect(msg).toContain('0x1234567890123456789012345678901234567890')
    expect(msg).toContain('Sign in')
    expect(client.auth.web3.eip155.verify).toHaveBeenCalledWith({
      body: { message: msg, signature: '0xsig', domain: 'localhost' },
      throwOnError: true,
    })
  })

  it('POSTs tokens to authCallbackUrl when set', async () => {
    const client = createMockClient()
    const signMessage = vi.fn().mockResolvedValue({ signature: '0xsig' })
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }))

    const { result } = renderHook(
      () =>
        useWalletAuth({
          chain: 'eip155',
          address: '0x1234567890123456789012345678901234567890',
          signMessage,
          domain: 'localhost',
        }),
      { wrapper: createWrapper(client, '/api/auth/callback') },
    )

    await waitFor(() => expect(result.current).toBeDefined())
    await act(async () => {
      await result.current.signIn()
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/callback',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'access-token',
          refreshToken: 'refresh-token',
        }),
        credentials: 'include',
        redirect: 'follow',
      }),
    )
    fetchSpy.mockRestore()
  })

  it('sets error when address is undefined', async () => {
    const client = createMockClient()
    const signMessage = vi.fn()
    const { result } = renderHook(
      () =>
        useWalletAuth({
          chain: 'eip155',
          address: undefined,
          signMessage,
        }),
      { wrapper: createWrapper(client) },
    )

    await act(async () => {
      await result.current.signIn()
    })

    await waitFor(() => {
      expect(result.current.error?.message).toContain('No wallet address')
    })
    expect(signMessage).not.toHaveBeenCalled()
    expect(client.auth.web3.eip155.verify).not.toHaveBeenCalled()
  })

  it('sets user-friendly error when wallet rejects (user denied)', async () => {
    const client = createMockClient()
    const signMessage = vi.fn().mockRejectedValue(new Error('User denied the request'))
    const { result } = renderHook(
      () =>
        useWalletAuth({
          chain: 'eip155',
          address: '0x1234567890123456789012345678901234567890',
          signMessage,
          domain: 'localhost',
        }),
      { wrapper: createWrapper(client) },
    )

    await act(async () => {
      await result.current.signIn()
    })

    await waitFor(() => {
      expect(result.current.error?.message).toBe('User rejected signing')
    })
  })
})
