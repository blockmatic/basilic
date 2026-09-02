'use client'

import { ApiError } from '@repo/core'
import { useReactApiConfig } from '@repo/react'
import { logger } from '@repo/utils/logger/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { updateAuthTokens } from '@/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/lib/auth/auth-error-messages'
import { env } from '@/lib/env'

type MomentNotification = {
  isDisplayed: () => boolean
  isSkippedMoment: () => boolean
  isNotDisplayed?: () => boolean
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            context?: string
          }) => void
          prompt: (momentListener?: (notification: MomentNotification) => void) => void
        }
      }
    }
  }
}

const gisScriptUrl = 'https://accounts.google.com/gsi/client'

const loadPromises = new Map<string, Promise<void>>()

function loadScript(src: string): Promise<void> {
  const existing = loadPromises.get(src)
  if (existing) return existing

  const el = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
  const rawPromise = el
    ? new Promise<void>((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve()
          return
        }
        el.addEventListener('load', () => resolve(), { once: true })
        el.addEventListener(
          'error',
          () => {
            el.remove()
            reject(new Error('Failed to load Google Identity Services'))
          },
          { once: true },
        )
      })
    : new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => {
          script.remove()
          reject(new Error('Failed to load Google Identity Services'))
        }
        document.head.appendChild(script)
      })
  const promise = rawPromise.catch(err => {
    loadPromises.delete(src)
    throw err
  })
  loadPromises.set(src, promise)
  return promise
}

function shouldFallbackToRedirect(notification: MomentNotification | undefined): boolean {
  if (!notification) return false
  if (notification.isSkippedMoment?.()) return true
  if (typeof notification.isNotDisplayed === 'function' && notification.isNotDisplayed())
    return true
  return false
}

export function useGoogleOneTap({
  onCredential,
  onSkipped,
  enabled = true,
}: {
  onCredential?: (credential: string) => Promise<void>
  onSkipped?: () => void
  enabled?: boolean
} = {}) {
  const router = useRouter()
  const { client, queryClientDefaults } = useReactApiConfig()
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const [isReady, setIsReady] = useState(false)
  const [onCredentialPending, setOnCredentialPending] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const handledRef = useRef(false)

  const { mutateAsync: verifyIdToken, isPending: isVerifyPending } = useMutation({
    mutationFn: (credential: string) =>
      client.auth.oauth.google.verifyIdToken({ body: { credential }, throwOnError: true }),
    ...queryClientDefaults,
  })

  const handleMoment = useCallback(
    (notification: MomentNotification | undefined) => {
      if (shouldFallbackToRedirect(notification)) {
        handledRef.current = false
        onSkipped?.()
      }
    },
    [onSkipped],
  )

  const handleCredential = useCallback(
    async (credential: string) => {
      if (handledRef.current) return
      handledRef.current = true

      if (onCredential) {
        setOnCredentialPending(true)
        try {
          await onCredential(credential)
        } catch (err) {
          handledRef.current = false
          throw err
        } finally {
          setOnCredentialPending(false)
        }
        return
      }

      try {
        const data = await verifyIdToken(credential)
        await updateAuthTokens({ token: data.token, refreshToken: data.refreshToken })
        router.push('/')
      } catch (err) {
        if (err instanceof ApiError)
          if (err.status === 503) toast.error(getAuthErrorMessage('oauth_not_configured'))
          else if (err.status === 429) toast.error(getAuthErrorMessage('rate_limit_exceeded'))
          else toast.error(getAuthErrorMessage('oauth_failed_google'))
        else toast.error(getAuthErrorMessage('oauth_failed_google'))

        handledRef.current = false
      }
    },
    [onCredential, router, verifyIdToken],
  )

  useEffect(() => {
    if (!enabled || !clientId) return

    let cancelled = false
    loadScript(gisScriptUrl)
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: response => handleCredential(response.credential),
          context: 'signin',
        })
        window.google.accounts.id.prompt(handleMoment)
        if (!cancelled) setIsReady(true)
      })
      .catch(err => {
        if (!cancelled) setLoadError(true)
        logger.warn({ err }, 'Google Identity Services failed to load')
      })

    return () => {
      cancelled = true
    }
  }, [clientId, enabled, handleCredential, handleMoment])

  const prompt = useCallback(() => {
    if (loadError) {
      onSkipped?.()
      toast.error(getAuthErrorMessage('oauth_not_configured'))
      return
    }
    if (window.google?.accounts?.id && clientId) {
      handledRef.current = false
      window.google.accounts.id.prompt(handleMoment)
    } else if (!clientId) {
      toast.error(getAuthErrorMessage('oauth_not_configured'))
    }
  }, [clientId, handleMoment, loadError, onSkipped])

  return {
    isReady: !!clientId && isReady && !loadError,
    isPending: onCredential ? onCredentialPending : isVerifyPending,
    prompt,
    isConfigured: !!clientId,
  }
}
