'use client'

import type { AuthPasskeyVerifyData } from '@repo/core'
import { startAuthentication } from '@simplewebauthn/browser'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

export type UsePasskeyAuthParams =
  | { callbackUrl: string; onSuccess?: never }
  | {
      callbackUrl?: undefined
      onSuccess: (data: { token: string; refreshToken: string }) => void | Promise<void>
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
    mutationFn: async (variables: UsePasskeyAuthParams) => {
      const callbackUrl = 'callbackUrl' in variables ? variables.callbackUrl : undefined
      const { options, sessionId } = await client.auth.passkey.start({ throwOnError: true })
      let assertion: Awaited<ReturnType<typeof startAuthentication>>
      try {
        assertion = await startAuthentication({
          optionsJSON: options as Parameters<typeof startAuthentication>[0]['optionsJSON'],
        })
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Sign-in cancelled', { cause: err })
      }

      const body: AuthPasskeyVerifyData['body'] = {
        assertion: assertion as AuthPasskeyVerifyData['body']['assertion'],
        sessionId,
        ...(callbackUrl?.trim() && { callbackUrl }),
      }
      const result = await client.auth.passkey.verify({ body, throwOnError: true })

      const redirectUrl = 'redirectUrl' in result ? result.redirectUrl : undefined
      if (redirectUrl) {
        try {
          const parsed = new URL(redirectUrl, window.location.origin)
          const allowedOrigin = callbackUrl?.trim()
            ? new URL(callbackUrl, window.location.origin).origin
            : window.location.origin
          const okScheme = parsed.protocol === 'http:' || parsed.protocol === 'https:'
          const okOrigin = parsed.origin === allowedOrigin
          if (okScheme && okOrigin) window.location.assign(redirectUrl)
          else window.location.assign('/')
        } catch {
          window.location.assign('/')
        }
        return
      }

      const token = 'token' in result ? result.token : undefined
      const refreshToken = 'refreshToken' in result ? result.refreshToken : undefined
      if (token && refreshToken) return { token, refreshToken }
      throw new Error('Server did not return tokens')
    },
    onSuccess: async (data, variables) => {
      if (data) await variables.onSuccess?.(data)
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'jwt'] })
    },
  })
}
