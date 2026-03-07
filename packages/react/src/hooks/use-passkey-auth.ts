'use client'

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
  const { client, baseUrl } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ callbackUrl }: UsePasskeyAuthParams) => {
      const url =
        baseUrl?.replace(/\/$/, '') ??
        (await import('@repo/core').then(m => m.getClientConfig?.(client)?.baseUrl)) ??
        ''
      if (!url) throw new Error('baseUrl is required for passkey auth')

      const startRes = await fetch(`${url}/auth/passkey/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!startRes.ok) {
        const err = await startRes.text()
        throw new Error(err || `Start failed: ${startRes.status}`)
      }
      const { options, sessionId } = (await startRes.json()) as {
        options: import('@simplewebauthn/browser').PublicKeyCredentialRequestOptionsJSON
        sessionId: string
      }
      let assertion: Awaited<ReturnType<typeof startAuthentication>>
      try {
        assertion = await startAuthentication({
          optionsJSON:
            options as import('@simplewebauthn/browser').PublicKeyCredentialRequestOptionsJSON,
        })
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Sign-in cancelled')
      }
      if (!assertion) throw new Error('Sign-in cancelled')

      const verifyRes = await fetch(`${url}/auth/passkey/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assertion, sessionId, callbackUrl }),
      })
      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({ message: verifyRes.statusText }))
        throw new Error(err?.message ?? `Verify failed: ${verifyRes.status}`)
      }
      const { redirectUrl } = (await verifyRes.json()) as { redirectUrl: string }
      if (redirectUrl) window.location.assign(redirectUrl)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'jwt'] })
    },
  })
}
