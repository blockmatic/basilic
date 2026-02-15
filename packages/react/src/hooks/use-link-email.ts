'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'
import { useUser } from './use-user'

export type UseLinkEmailConfig = {
  /** Callback after verify succeeds; use to POST tokens to update-tokens endpoint */
  onVerifySuccess?: (data: { token: string; refreshToken: string }) => void | Promise<void>
}

export type UseLinkEmailResult = {
  requestLink: (params: { email: string; callbackUrl: string }) => Promise<void>
  verifyFromToken: (params: { token: string }) => Promise<{ token: string; refreshToken: string }>
  isRequestPending: boolean
  isVerifyPending: boolean
  error: Error | null
  /** True when user is loaded and authenticated (ready to link) */
  isReady: boolean
}

/**
 * Links email to current authenticated user (e.g. incognito → link email).
 * requestLink sends verification email; verifyFromToken verifies token from link.
 * isReady when useUser has loaded and user is authenticated.
 */
export function useLinkEmail(config?: UseLinkEmailConfig): UseLinkEmailResult {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()
  const { data: userData, isLoading: isUserLoading } = useUser()

  const isReady = !isUserLoading && !!userData?.user

  const requestMutation = useMutation({
    mutationFn: async ({ email, callbackUrl }: { email: string; callbackUrl: string }) => {
      await client.account.link.email.request({
        body: { email, callbackUrl },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      const result = (await client.account.link.email.verify({
        body: { token },
        throwOnError: true,
      })) as unknown as { token: string; refreshToken: string }
      return result
    },
    onSuccess: data => {
      config?.onVerifySuccess?.(data)
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
    },
  })

  const requestLink = async (params: { email: string; callbackUrl: string }) => {
    try {
      await requestMutation.mutateAsync(params)
    } catch {
      /* Error in requestMutation.error */
    }
  }

  const verifyFromToken = async (params: { token: string }) => {
    const result = await verifyMutation.mutateAsync(params)
    if (!result) throw new Error('Verify failed')
    return result
  }

  const error = (requestMutation.error ?? verifyMutation.error) as Error | null

  return {
    requestLink,
    verifyFromToken,
    isRequestPending: requestMutation.isPending,
    isVerifyPending: verifyMutation.isPending,
    error: error ?? null,
    isReady,
  }
}
