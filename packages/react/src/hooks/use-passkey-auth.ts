'use client'

import type { AuthPasskeyVerifyData } from '@repo/core'
import { startAuthentication } from '@simplewebauthn/browser'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

export type UsePasskeyAuthParams = {
  /** Absolute callback URL (e.g. `${origin}/auth/callback/passkey?callbackUrl=/`) */
  callbackUrl: string
}

/**
 * Mutation hook for passkey sign-in. Calls start → startAuthentication → verify.
 * When successful, server returns { redirectUrl }; client performs window.location.assign.
 * No credentials required; sessionId is passed in request body.
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
      if (!assertion) throw new Error('Sign-in cancelled')

      const body: AuthPasskeyVerifyData['body'] = {
        assertion: assertion as AuthPasskeyVerifyData['body']['assertion'],
        sessionId,
        callbackUrl,
      }
      const result = await client.auth.passkey.verify({ body, throwOnError: true })
      const redirectUrl = 'redirectUrl' in result ? result.redirectUrl : undefined
      if (redirectUrl) window.location.assign(redirectUrl)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'jwt'] })
    },
  })
}
