'use client'

import { type UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../../context'

export function useUnlinkWallet(): UseMutationResult<void, unknown, { id: string }> {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await client.account.link.wallet.id({
        path: { id },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
    },
  })
}
