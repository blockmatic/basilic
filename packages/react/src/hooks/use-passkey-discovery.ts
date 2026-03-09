'use client'

import { browserSupportsWebAuthnAutofill, startAuthentication } from '@simplewebauthn/browser'
import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'
import { useWebAuthnAvailable } from './use-webauthn-available'

const queryKey = ['auth', 'passkey', 'discovery'] as const

export function usePasskeyDiscovery() {
  const { client } = useReactApiConfig()
  const webauthnAvailable = useWebAuthnAvailable()

  const { data, isPending, isError } = useQuery({
    queryKey,
    queryFn: async (): Promise<{ email: string | null }> => {
      if (!webauthnAvailable) return { email: null }
      const autofillSupported = await browserSupportsWebAuthnAutofill()
      if (!autofillSupported) return { email: null }

      const { options } = await client.auth.passkey.start({ throwOnError: true })
      let credential: Awaited<ReturnType<typeof startAuthentication>>
      try {
        credential = await startAuthentication({
          optionsJSON: options as Parameters<typeof startAuthentication>[0]['optionsJSON'],
          useBrowserAutofill: true,
        })
      } catch (err) {
        if (err instanceof Error && err.name === 'NotAllowedError') return { email: null }
        throw err
      }

      const userHandle = credential?.response?.userHandle
      if (!userHandle) return { email: null }

      const result = await client.auth.passkey.resolveUser({
        body: { userHandle },
        throwOnError: true,
      })
      return { email: result.maskedIdentifier }
    },
    enabled: webauthnAvailable,
    staleTime: 5 * 60 * 1000,
  })

  return { email: data?.email ?? null, isPending, isError }
}
