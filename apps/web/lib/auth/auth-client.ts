import { z } from 'zod'
import { env } from '@/lib/env'
import { parseAuthCookie } from './parse-auth-cookie'

function getRawAuthCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${env.NEXT_PUBLIC_AUTH_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`,
    ),
  )
  const value = match?.[1]
  return value ? decodeURIComponent(value) : null
}

export async function getAuthToken(): Promise<string | null> {
  return parseAuthCookie(getRawAuthCookie() ?? undefined).token ?? null
}

export async function getRefreshToken(): Promise<string | null> {
  return parseAuthCookie(getRawAuthCookie() ?? undefined).refreshToken ?? null
}

const errorResponseSchema = z.object({ message: z.string().optional() })

export async function updateAuthTokens({
  token,
  refreshToken,
}: {
  token: string
  refreshToken: string
}) {
  let response: Response
  try {
    response = await fetch('/api/auth/update-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, refreshToken }),
      credentials: 'include',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Token refresh request failed: ${msg}`)
  }

  if (!response.ok) {
    const bodyText = await response.text()
    const errorDetail =
      (() => {
        try {
          const parsed = errorResponseSchema.safeParse(JSON.parse(bodyText))
          return (parsed.success && parsed.data.message) ?? bodyText
        } catch {
          return bodyText
        }
      })() || `HTTP ${response.status}`
    throw new Error(`Token refresh failed (${response.status}): ${errorDetail}`)
  }
}
