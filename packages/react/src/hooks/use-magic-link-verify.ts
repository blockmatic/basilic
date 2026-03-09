import type { MagiclinkVerifyData, MagiclinkVerifyResponse } from '@repo/core'
import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

/**
 * React Query mutation hook for magic link verify endpoint.
 *
 * Exchanges 6-digit login code for JWTs. Uses the API client configured in
 * `ReactApiProvider` and applies default mutation options from context.
 *
 * @param options - Additional TanStack Query mutation options (merged with context defaults)
 * @returns TanStack Query mutation result
 */
export function useMagicLinkVerify(
  options?: Omit<
    UseMutationOptions<MagiclinkVerifyResponse, Error, MagiclinkVerifyData['body']>,
    'mutationFn'
  >,
) {
  const { client, queryClientDefaults } = useReactApiConfig()

  return useMutation<MagiclinkVerifyResponse, Error, MagiclinkVerifyData['body']>({
    mutationFn: async variables =>
      client.auth.magiclink.verify({
        body: variables,
      }),
    ...queryClientDefaults,
    ...options,
  })
}
