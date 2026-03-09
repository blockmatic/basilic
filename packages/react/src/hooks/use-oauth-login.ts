import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

const redirectProviders = ['github', 'facebook', 'twitter'] as const
export type OAuthRedirectProvider = (typeof redirectProviders)[number]

type AuthorizeUrlResponse = { redirectUrl: string }

/**
 * React Query mutation hook for OAuth redirect providers (GitHub, Facebook, Twitter).
 *
 * Fetches the authorization URL from the API and redirects the browser to the provider.
 * On 503 (OAUTH_NOT_CONFIGURED), the mutation throws so the caller can show a toast.
 *
 * @param options - Additional TanStack Query mutation options (merged with context defaults)
 * @returns TanStack Query mutation result
 */
export function useOAuthLogin(
  options?: Omit<
    UseMutationOptions<AuthorizeUrlResponse, Error, OAuthRedirectProvider>,
    'mutationFn'
  >,
) {
  const { client, queryClientDefaults } = useReactApiConfig()

  return useMutation<AuthorizeUrlResponse, Error, OAuthRedirectProvider>({
    mutationFn: async provider => {
      const endpoints = {
        github: client.auth.oauth.github.authorizeUrl,
        facebook: client.auth.oauth.facebook.authorizeUrl,
        twitter: client.auth.oauth.twitter.authorizeUrl,
      }
      const data = await endpoints[provider]()
      if (typeof data?.redirectUrl === 'string') window.location.href = data.redirectUrl

      return data
    },
    ...queryClientDefaults,
    ...options,
  })
}
