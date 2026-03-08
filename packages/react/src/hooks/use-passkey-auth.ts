'use client'

import type { AuthPasskeyVerifyData } from '@repo/core'
import { startAuthentication } from '@simplewebauthn/browser'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

export type UsePasskeyAuthParams = {
  /** Absolute callback URL for redirect flow. When absent, returns tokens directly. */
  callbackUrl?: string
  /** Called with tokens when callbackUrl is absent (direct token flow) */
  onSuccess?: (data: { token: string; refreshToken: string }) => void
}

/**
 * Mutation hook for passkey sign-in. Calls start → startAuthentication → verify.
 * When callbackUrl provided: server returns { redirectUrl }, client performs window.location.assign.
 * When callbackUrl absent: server returns { token, refreshToken }, onSuccess is called.
 */
export function usePasskeyAuth() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ callbackUrl }: UsePasskeyAuthParams) => {
      const { options, sessionId } = await client.auth.passkey.start({ throwOnError: true })
      let assertion: Awaited<ReturnType<typeof startAuthentication>>
      try {
        assertion = await startAuthentication({
          optionsJSON: options as Parameters<typeof startAuthentication>[0]['optionsJSON'],
        })
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Sign-in cancelled')
      }

      const body: AuthPasskeyVerifyData['body'] = {
        assertion: assertion as AuthPasskeyVerifyData['body']['assertion'],
        sessionId,
        ...(callbackUrl?.trim() && { callbackUrl }),
      }
      const result = await client.auth.passkey.verify({ body, throwOnError: true })

      const redirectUrl = 'redirectUrl' in result ? result.redirectUrl : undefined
      if (redirectUrl) {
        window.location.assign(redirectUrl)
        return
      }

      const token = 'token' in result ? result.token : undefined
      const refreshToken = 'refreshToken' in result ? result.refreshToken : undefined
      if (token && refreshToken) return { token, refreshToken }
      throw new Error('Server did not return tokens')
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'jwt'] })
      if (data) variables.onSuccess?.(data)
    },
  })
}
