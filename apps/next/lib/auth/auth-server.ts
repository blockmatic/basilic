import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import type { AuthCookie } from './auth-schemas'
import { authCookieSchema } from './auth-schemas'
import { decodeJwtToken } from './jwt-utils'
import { parseAuthCookie } from './parse-auth-cookie'

const cookieName = env.NEXT_PUBLIC_AUTH_COOKIE_NAME

function getAuthCookieOptions({ maxAge }: { maxAge?: number }) {
  return {
    httpOnly: false,
    maxAge,
    path: '/',
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
  }
}

function getMaxAgeFromRefreshToken(refreshToken: string): number {
  const decoded = decodeJwtToken({ token: refreshToken })
  if (!decoded?.exp) return 604800
  return Math.max(0, Math.floor(decoded.exp - Date.now() / 1000))
}

export function setAuthCookiesOnResponse(
  response: { cookies: { set: (name: string, value: string, opts?: object) => void } },
  { token, refreshToken }: AuthCookie,
) {
  const maxAge = getMaxAgeFromRefreshToken(refreshToken)
  const opts = getAuthCookieOptions({ maxAge })
  const cleanOpts = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
  response.cookies.set(
    cookieName,
    JSON.stringify({ token, refreshToken }),
    cleanOpts as typeof opts,
  )
}

export function clearAuthCookiesOnResponse(response: {
  cookies: { set: (name: string, value: string, opts?: object) => void }
}) {
  const opts = getAuthCookieOptions({ maxAge: 0 })
  const cleanOpts = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
  response.cookies.set(cookieName, '', { ...cleanOpts, maxAge: 0 } as typeof opts)
}

export async function getServerAuthToken(): Promise<{ token: string | null }> {
  const cookieStore = await cookies()
  const { token } = parseAuthCookie(cookieStore.get(cookieName)?.value)
  return { token }
}

export async function refreshTokensWithRefreshToken({
  refreshToken,
}: {
  refreshToken: string
}): Promise<AuthCookie | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/session/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return null
    const parsed = authCookieSchema.safeParse(await response.json())
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
