'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { updateAuthTokens } from '@/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/lib/auth/auth-error-messages'
import { env } from '@/lib/env'

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
          prompt: (
            momentListener?: (notification: {
              isDisplayed: () => boolean
              isSkippedMoment: () => boolean
            }) => void,
          ) => void
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

export function useGoogleOneTap({
  onCredential,
  enabled = true,
}: {
  onCredential?: (credential: string) => Promise<void>
  enabled?: boolean
} = {}) {
  const router = useRouter()
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const [isReady, setIsReady] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const handledRef = useRef(false)

  const handleCredential = useCallback(
    async (credential: string) => {
      if (handledRef.current) return
      handledRef.current = true
      setIsPending(true)

      if (onCredential) {
        try {
          await onCredential(credential)
        } catch (err) {
          handledRef.current = false
          throw err
        } finally {
          setIsPending(false)
        }
        return
      }

      try {
        const baseUrl = env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${baseUrl}/auth/oauth/google/verify-id-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
          credentials: 'include',
        })

        const data = await res.json().catch(() => ({}))
        if (res.status === 503) {
          toast.error(getAuthErrorMessage('oauth_not_configured'))
          handledRef.current = false
          setIsPending(false)
          return
        }
        if (!res.ok) {
          toast.error(getAuthErrorMessage('oauth_failed_google'))
          handledRef.current = false
          setIsPending(false)
          return
        }
        const tokens =
          data?.token && data?.refreshToken
            ? { token: data.token, refreshToken: data.refreshToken }
            : null
        if (!tokens) {
          toast.error(getAuthErrorMessage('oauth_failed_google'))
          handledRef.current = false
          setIsPending(false)
          return
        }
        await updateAuthTokens(tokens)
        router.push('/')
      } catch {
        toast.error(getAuthErrorMessage('oauth_failed_google'))
        handledRef.current = false
      } finally {
        setIsPending(false)
      }
    },
    [onCredential, router],
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
        })
        window.google.accounts.id.prompt(notification => {
          if (notification?.isSkippedMoment?.()) handledRef.current = false
        })
        if (!cancelled) setIsReady(true)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [clientId, enabled, handleCredential])

  const prompt = useCallback(() => {
    if (window.google?.accounts?.id && clientId) {
      handledRef.current = false
      window.google.accounts.id.prompt()
    } else if (!clientId) {
      toast.error(getAuthErrorMessage('oauth_not_configured'))
    }
  }, [clientId])

  return { isReady: !!clientId && isReady, isPending, prompt, isConfigured: !!clientId }
}
