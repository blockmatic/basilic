'use client'

import type { AccountApikeysCreateResponse, AccountApikeysListResponse } from '@repo/core'
import { useReactApiConfig } from '@repo/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const apiKeysQueryKey = ['account', 'apikeys'] as const

export function useApiKeysList() {
  const { client } = useReactApiConfig()
  return useQuery({
    queryKey: apiKeysQueryKey,
    queryFn: async () => {
      const res = (await client.account.apikeys.list({ throwOnError: true })) as unknown as
        | AccountApikeysListResponse
        | { data: AccountApikeysListResponse }
      return 'keys' in res ? res : res.data
    },
  })
}

export function useCreateApiKey() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const res = (await client.account.apikeys.create({
        body: { name },
        throwOnError: true,
      })) as unknown as AccountApikeysCreateResponse | { data: AccountApikeysCreateResponse }
      return 'key' in res ? res : res.data
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
