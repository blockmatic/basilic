import { env } from '@/lib/env'

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  )
  const value = match?.[1]
  return value ? decodeURIComponent(value) : null
}

function readAuthCookie(): { token: string; refreshToken: string } | null {
  const raw = parseCookie(env.NEXT_PUBLIC_AUTH_COOKIE_NAME)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as { token?: unknown }).token === 'string' &&
      typeof (parsed as { refreshToken?: unknown }).refreshToken === 'string'
    )
      return {
        token: (parsed as { token: string }).token,
        refreshToken: (parsed as { refreshToken: string }).refreshToken,
      }
  } catch {
    // ignore
  }
  return null
}

export async function getAuthToken(): Promise<string | null> {
  return readAuthCookie()?.token ?? null
}

export async function getRefreshToken(): Promise<string | null> {
  return readAuthCookie()?.refreshToken ?? null
}

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
          return (JSON.parse(bodyText) as { message?: string })?.message ?? bodyText
        } catch {
          return bodyText
        }
      })() || `HTTP ${response.status}`
    throw new Error(`Token refresh failed (${response.status}): ${errorDetail}`)
  }
}
