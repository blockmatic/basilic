'use client'

import { useReactApiConfig } from '@repo/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const sessionsQueryKey = ['auth', 'sessions'] as const

export function useSessionsList() {
  const { client } = useReactApiConfig()
  return useQuery({
    queryKey: sessionsQueryKey,
    queryFn: () => client.auth.sessions.list({ throwOnError: true }),
  })
}

export function useRevokeSession() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await client.auth.sessions.id({ path: { id }, throwOnError: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey })
    },
  })
}
