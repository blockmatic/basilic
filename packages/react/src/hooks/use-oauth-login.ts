import type { OauthGithubAuthorizeUrlResponse } from '@repo/core'
import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

/**
 * React Query mutation hook for GitHub OAuth authorize flow.
 *
 * Fetches the authorization URL from the API and redirects the browser to GitHub.
 * Uses the API client configured in `ReactApiProvider`.
 *
 * @param options - Additional TanStack Query mutation options (merged with context defaults)
 * @returns TanStack Query mutation result
 *
 * @example
 * ```tsx
 * function LoginActions() {
 *   const { mutate, isPending } = useOAuthLogin()
 *
 *   return (
 *     <Button onClick={() => mutate()} disabled={isPending}>
 *       {isPending ? 'Redirecting...' : 'Continue with GitHub'}
 *     </Button>
 *   )
 * }
 * ```
 */
export function useOAuthLogin(
  options?: Omit<UseMutationOptions<OauthGithubAuthorizeUrlResponse, Error, void>, 'mutationFn'>,
) {
  const { client, queryClientDefaults } = useReactApiConfig()

  return useMutation<OauthGithubAuthorizeUrlResponse, Error, void>({
    mutationFn: async () => {
      const data = await client.auth.oauth.github.authorizeUrl()
      if (typeof data?.redirectUrl === 'string') window.location.href = data.redirectUrl

      return data
    },
    ...queryClientDefaults,
    ...options,
  })
}
