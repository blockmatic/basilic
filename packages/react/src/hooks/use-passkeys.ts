'use client'

import { startRegistration } from '@simplewebauthn/browser'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

const passkeysQueryKey = ['account', 'passkeys'] as const
const userQueryKey = ['auth', 'session', 'user'] as const

export function usePasskeysList() {
  const { client } = useReactApiConfig()
  return useQuery({
    queryKey: passkeysQueryKey,
    queryFn: () => client.account.passkeys({ throwOnError: true }),
  })
}

export function usePasskeyRegister() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name }: { name?: string } = {}) => {
      const { options } = await client.account.link.passkey.start({ throwOnError: true })
      const credential = await startRegistration({ optionsJSON: options })
      await client.account.link.passkey.finish({
        body: { credential, ...(name?.trim() && { name: name.trim().slice(0, 64) }) },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passkeysQueryKey })
      queryClient.invalidateQueries({ queryKey: userQueryKey })
    },
  })
}

export function usePasskeyRemove() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await client.account.link.passkey.id({
        path: { id },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passkeysQueryKey })
      queryClient.invalidateQueries({ queryKey: userQueryKey })
    },
  })
}
