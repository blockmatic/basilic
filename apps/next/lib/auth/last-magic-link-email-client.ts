'use client'

import { useSyncExternalStore } from 'react'

const lastMagicLinkEmailStorageKey = 'auth.last_magic_link_email'

/**
 * Client-side: stores the last email used for magic link in localStorage.
 * Used for pre-filling the magic link form on next visit. Does not send PII with requests.
 */
export function setLastMagicLinkEmail(email: string): void {
  if (typeof window === 'undefined') return

  try {
    const value = encodeURIComponent(email)
    localStorage.setItem(lastMagicLinkEmailStorageKey, value)
  } catch {
    // localStorage may be full or disabled
  }
}

function getSnapshot(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const value = localStorage.getItem(lastMagicLinkEmailStorageKey)
    if (!value) return undefined
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

/**
 * Hook that reads the last magic link email from localStorage for form prefill.
 * Returns undefined during SSR.
 */
export function useLastMagicLinkEmail(): string | undefined {
  return useSyncExternalStore(
    () => () => {},
    getSnapshot,
    () => undefined,
  )
}
