import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

const redirectProviders = ['github', 'google', 'facebook', 'twitter'] as const
export type OAuthRedirectProvider = (typeof redirectProviders)[number]

export type OAuthLoginInput =
  | OAuthRedirectProvider
  | { provider: OAuthRedirectProvider; redirectUri?: string }

type AuthorizeUrlResponse = { redirectUrl: string }

/**
 * React Query mutation hook for OAuth redirect providers (GitHub, Facebook, Twitter).
 *
 * Fetches the authorization URL from the API and redirects the browser to the provider.
 * On 503 (OAUTH_NOT_CONFIGURED), the mutation throws so the caller can show a toast.
 *
 * For Google, optional redirectUri can be passed for mobile apps (custom scheme). Must be
 * in the allowlist (OAUTH_GOOGLE_CALLBACK_URLS). Web clients omit it to use the default.
 *
 * @example
 * mutate('github')
 * mutate('google')
 * mutate({ provider: 'google', redirectUri: 'yourapp://auth/callback' })
 *
 * @param options - Additional TanStack Query mutation options (merged with context defaults)
 * @returns TanStack Query mutation result
 */
export function useOAuthLogin(
  options?: Omit<UseMutationOptions<AuthorizeUrlResponse, Error, OAuthLoginInput>, 'mutationFn'>,
) {
  const { client, queryClientDefaults } = useReactApiConfig()

  return useMutation<AuthorizeUrlResponse, Error, OAuthLoginInput>({
    mutationFn: async input => {
      const provider = typeof input === 'string' ? input : input.provider
      const redirectUri = typeof input === 'object' ? input.redirectUri : undefined
      const data =
        provider === 'google' && redirectUri
          ? await client.auth.oauth.google.authorizeUrl({
              query: {
                // biome-ignore lint/style/useNamingConvention: OAuth API expects redirect_uri
                redirect_uri: redirectUri,
              },
            })
          : await (
              {
                github: client.auth.oauth.github.authorizeUrl,
                google: client.auth.oauth.google.authorizeUrl,
                facebook: client.auth.oauth.facebook.authorizeUrl,
                twitter: client.auth.oauth.twitter.authorizeUrl,
              } as const
            )[provider]()
      const url = data?.redirectUrl
      if (typeof url !== 'string' || !url.trim())
        throw new Error(`OAuth redirectUrl missing or invalid for provider: ${provider}`)

      let parsed: URL
      try {
        parsed = new URL(url)
      } catch {
        throw new Error(`OAuth redirectUrl missing or invalid for provider: ${provider}`)
      }
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
        throw new Error(`OAuth redirectUrl missing or invalid for provider: ${provider}`)
      window.location.href = parsed.href
      return data
    },
    ...queryClientDefaults,
    ...options,
  })
}
