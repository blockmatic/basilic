import { env } from '@/lib/env'

const lastMagicLinkEmailCookieName = 'auth.last_magic_link_email'

/**
 * Client-side: sets a cookie with the last email used for magic link request.
 * Used for pre-filling the magic link form on next visit.
 */
export function setLastMagicLinkEmailCookie(email: string): void {
  if (typeof document === 'undefined') return

  const value = encodeURIComponent(email)
  const maxAge = 31536000 // 1 year
  const secure = env.NEXT_PUBLIC_NODE_ENV !== 'development' ? '; Secure' : ''
  // biome-ignore lint/suspicious/noDocumentCookie: client-only UX cookie for magic link email pre-fill
  document.cookie = `${lastMagicLinkEmailCookieName}=${value}; path=/; max-age=${maxAge}; sameSite=lax${secure}`
}
