'use client'

import type { AccountProfileUpdateData } from '@repo/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

const userQueryKey = ['auth', 'session', 'user'] as const

export function useProfileUpdate() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AccountProfileUpdateData['body']) =>
      client.account.profile({
        body,
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKey })
    },
  })
}
