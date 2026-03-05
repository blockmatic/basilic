'use client'

import { useReactApiConfig } from '@repo/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const apiKeysQueryKey = ['account', 'apikeys'] as const

export function useApiKeysList() {
  const { client } = useReactApiConfig()
  return useQuery({
    queryKey: apiKeysQueryKey,
    queryFn: async () => {
      const res = await client.account.apikeys.list({ throwOnError: true })
      return res as unknown as {
        keys: {
          id: string
          name: string
          prefix: string
          lastUsedAt: string | null
          expiresAt: string | null
          createdAt: string
        }[]
      }
    },
  })
}

export function useCreateApiKey() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const res = await client.account.apikeys.create({
        body: { name },
        throwOnError: true,
      })
      return res as unknown as {
        id: string
        name: string
        key: string
        prefix: string
        createdAt: string
      }
    },
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
