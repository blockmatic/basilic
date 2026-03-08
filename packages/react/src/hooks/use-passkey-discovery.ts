'use client'

import {
  browserSupportsWebAuthnAutofill,
  startAuthentication,
  WebAuthnError,
} from '@simplewebauthn/browser'
import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'
import { useWebAuthnAvailable } from './use-webauthn-available'

const discoveryStaleTime = 5 * 60 * 1000 // 5 min

export function usePasskeyDiscovery() {
  const { client } = useReactApiConfig()
  const webauthnAvailable = useWebAuthnAvailable()

  const { data, isPending, isError } = useQuery({
    queryKey: ['auth', 'passkey', 'discovery'],
    queryFn: async (): Promise<{ email: string | null }> => {
      if (
        typeof browserSupportsWebAuthnAutofill === 'function' &&
        !(await Promise.resolve(browserSupportsWebAuthnAutofill()))
      )
        return { email: null }

      const { options } = await client.auth.passkey.start({ throwOnError: true })
      let credential: Awaited<ReturnType<typeof startAuthentication>>
      try {
        credential = await startAuthentication({
          optionsJSON: options as Parameters<typeof startAuthentication>[0]['optionsJSON'],
          useBrowserAutofill: true,
        })
      } catch (err) {
        if (err instanceof WebAuthnError && err.code === 'ERROR_CEREMONY_ABORTED')
          return { email: null }
        throw err
      }

      const userHandle = credential?.response?.userHandle
      if (!userHandle || typeof userHandle !== 'string') return { email: null }

      try {
        const result = await client.auth.passkey.resolveUser({
          body: { userHandle },
          throwOnError: true,
        })
        return { email: result.email }
      } catch {
        // 404 or network error - treat as no discoverable user
        return { email: null }
      }
    },
    enabled: webauthnAvailable,
    staleTime: discoveryStaleTime,
    retry: false,
  })

  return {
    email: data?.email ?? null,
    isPending,
    isError,
  }
}
