const authCookieName = 'better-auth.jwt_token'
const refreshCookieName = 'better-auth.refresh_token'

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  )
  const value = match?.[1]
  return value ? decodeURIComponent(value) : null
}

export function getAuthTokenFromCookie(): string | null {
  return parseCookie(authCookieName)
}

export function getRefreshTokenFromCookie(): string | null {
  return parseCookie(refreshCookieName)
}

export async function getAuthToken(): Promise<string | null> {
  return getAuthTokenFromCookie()
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
