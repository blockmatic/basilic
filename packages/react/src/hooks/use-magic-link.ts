import type { MagiclinkRequestData, MagiclinkRequestResponse } from '@repo/core'
import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

/**
 * React Query mutation hook for magic link request endpoint.
 *
 * Sends magic link email to user. Uses the API client configured in `ReactApiProvider`
 * and applies default mutation options from context.
 *
 * @param options - Additional TanStack Query mutation options (merged with context defaults)
 * @returns TanStack Query mutation result
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { mutate, isPending, error } = useMagicLink({
 *     onSuccess: () => console.log('Magic link sent!'),
 *   })
 *
 *   return (
 *     <form onSubmit={(e) => {
 *       e.preventDefault()
 *       mutate({ email: e.currentTarget.email.value, callbackUrl: window.location.origin + '/' })
 *     }}>
 *       <input name="email" type="email" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Sending...' : 'Send Magic Link'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useMagicLink(
  options?: Omit<
    UseMutationOptions<MagiclinkRequestResponse, Error, MagiclinkRequestData['body']>,
    'mutationFn'
  >,
) {
  const { client, queryClientDefaults } = useReactApiConfig()

  return useMutation<MagiclinkRequestResponse, Error, MagiclinkRequestData['body']>({
    mutationFn: async variables =>
      client.auth.magiclink.request({
        body: variables,
      }),
    ...queryClientDefaults,
    ...options,
  })
}
