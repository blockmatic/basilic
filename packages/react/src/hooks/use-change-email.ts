'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'
import { useUser } from './use-user'

export type UseChangeEmailConfig = {
  onVerifySuccess?: (data: { token: string; refreshToken: string }) => void | Promise<void>
}

export type UseChangeEmailResult = {
  requestChange: (params: { email: string; callbackUrl: string }) => Promise<void>
  verify: (params: {
    token: string
    email?: string
    verificationId?: string
  }) => Promise<{ token: string; refreshToken: string }>
  isRequestPending: boolean
  isVerifyPending: boolean
  error: Error | null
  isReady: boolean
}

export function useChangeEmail(config?: UseChangeEmailConfig): UseChangeEmailResult {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()
  const { data: userData, isLoading: isUserLoading } = useUser()

  const isReady = !isUserLoading && !!userData?.user

  const requestMutation = useMutation({
    mutationFn: async ({ email, callbackUrl }: { email: string; callbackUrl: string }) => {
      await client.account.email.change.request({
        body: { email, callbackUrl },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async ({
      token,
      email,
      verificationId,
    }: {
      token: string
      email?: string
      verificationId?: string
    }) => {
      if (!verificationId && email == null)
        throw new Error('Either email or verificationId must be provided')
      const body = verificationId ? { token, verificationId } : { token, email }
      return client.account.email.change.verify({ body, throwOnError: true })
    },
    onSuccess: data => {
      config?.onVerifySuccess?.(data)
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'jwt'] })
    },
  })

  const requestChange = async (params: { email: string; callbackUrl: string }) => {
    try {
      await requestMutation.mutateAsync(params)
    } catch {
      /* Error in requestMutation.error */
    }
  }

  const verify = async (params: { token: string; email?: string; verificationId?: string }) => {
    const result = await verifyMutation.mutateAsync(params)
    if (!result) throw new Error('Verify failed')
    return result
  }

  const error = (requestMutation.error ?? verifyMutation.error) as Error | null

  return {
    requestChange,
    verify,
    isRequestPending: requestMutation.isPending,
    isVerifyPending: verifyMutation.isPending,
    error: error ?? null,
    isReady,
  }
}
