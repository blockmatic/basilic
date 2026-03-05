import type { GetUserResponse } from '@repo/core'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

/**
 * React Query hook for current user (auth/session/user).
 *
 * Fetches current user from authenticated endpoint. Returns 401 when signed out.
 * Uses the API client configured in ReactApiProvider.
 *
 * @param options - TanStack Query options. Default: retry: false (401 expected when signed out)
 * @returns TanStack Query result with user data or error when unauthenticated
 *
 * @example
 * ```tsx
 * function AuthStatus() {
 *   const { data, isLoading, isError } = useUser()
 *
 *   if (isLoading) return <span>Checking...</span>
 *   if (isError) return <span>Signed Out</span>
 *   return <span>Signed In: {data?.user.email}</span>
 * }
 * ```
 */
export function useUser(
  options?: Partial<Omit<UseQueryOptions<GetUserResponse, Error>, 'queryFn'>>,
) {
  const { client, queryClientDefaults } = useReactApiConfig()

  return useQuery<GetUserResponse, Error>({
    queryKey: ['auth', 'session', 'user'],
    queryFn: async () => client.auth.session.user(),
    retry: false,
    ...queryClientDefaults,
    ...options,
  })
}
