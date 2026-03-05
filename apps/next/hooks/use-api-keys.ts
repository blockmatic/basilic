'use client'

import { useReactApiConfig } from '@repo/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const apiKeysQueryKey = ['account', 'apikeys'] as const

export function useApiKeysList() {
  const { client } = useReactApiConfig()
  return useQuery({
    queryKey: apiKeysQueryKey,
    queryFn: () => client.account.apikeys.list({ throwOnError: true }),
  })
}

export function useCreateApiKey() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name }: { name: string }) =>
      client.account.apikeys.create({
        body: { name },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKey })
    },
  })
}

export function useRevokeApiKey() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await client.account.apikeys.id({ path: { id }, throwOnError: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKey })
    },
  })
}
