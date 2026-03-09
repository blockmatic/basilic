import { cookies } from 'next/headers'

const lastMagicLinkEmailCookieName = 'auth.last_magic_link_email'

/**
 * Server-side: reads the last magic link email from the cookie.
 * Returns undefined if not set or invalid.
 */
export async function getLastMagicLinkEmail(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const value = cookieStore.get(lastMagicLinkEmailCookieName)?.value
  if (!value) return undefined

  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}
