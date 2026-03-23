import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiProvider } from '../provider'
import { useLinkEmail } from './use-link-email'

function createMockClient() {
  const request = vi.fn().mockResolvedValue({ ok: true })
  const verify = vi.fn().mockResolvedValue({ token: 'new-token', refreshToken: 'new-refresh' })
  const user = vi.fn().mockResolvedValue({
    user: { id: 'user-1', email: null, name: null, emailVerified: null, linkedWallets: [] },
  })
  return {
    account: { link: { email: { request, verify } } },
    auth: { session: { user } },
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

describe('useLinkEmail', () => {
  it('calls request with email and callbackUrl', async () => {
    const client = createMockClient()
    const { result } = renderHook(() => useLinkEmail(), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current).toBeDefined())
    await act(async () => {
      await result.current.requestLink({
        email: 'user@example.com',
        callbackUrl: 'https://app.example.com/link-callback',
      })
    })

    expect(client.account.link.email.request).toHaveBeenCalledWith({
      body: {
        email: 'user@example.com',
        callbackUrl: 'https://app.example.com/link-callback',
      },
      throwOnError: true,
    })
  })
})
