'use client'

import { useReactApiConfig } from '@repo/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const userQueryKey = ['auth', 'session', 'user'] as const

export function useTotpSetup() {
  const { client } = useReactApiConfig()
  return useMutation({
    mutationFn: () => client.account.link.totp.setup({ throwOnError: true }),
  })
}

export function useTotpVerify() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ code }: { code: string }) =>
      client.account.link.totp.verify({
        body: { code },
        throwOnError: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKey })
    },
  })
}

export function useTotpUnlink() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => client.account.link.totp.unlink({ throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKey })
    },
  })
}
