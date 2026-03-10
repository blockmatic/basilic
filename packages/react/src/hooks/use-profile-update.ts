'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

const userQueryKey = ['auth', 'session', 'user'] as const

export function useProfileUpdate() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { name?: string; username?: string | null }) =>
      client.account.profile({
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKey })
    },
  })
}
