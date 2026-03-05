import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { decodeJwtToken } from './jwt-utils'

type AuthCookieOptions = {
  maxAge?: number
}

export const getAuthCookieOptions = ({ maxAge }: AuthCookieOptions) => ({
  httpOnly: false,
  maxAge,
  path: '/',
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
})

function getMaxAgeFromRefreshToken(refreshToken: string): number {
  const decoded = decodeJwtToken({ token: refreshToken })
  if (!decoded?.exp) return 604800
  return Math.max(0, Math.floor(decoded.exp - Date.now() / 1000))
}

export type SetAuthCookiesInput = {
  token: string
  refreshToken: string
}

export function setAuthCookiesOnResponse(
  response: { cookies: { set: (name: string, value: string, opts?: object) => void } },
  { token, refreshToken }: SetAuthCookiesInput,
) {
  const maxAge = getMaxAgeFromRefreshToken(refreshToken)
  const opts = getAuthCookieOptions({ maxAge })
  const cleanOpts = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
  const value = JSON.stringify({ token, refreshToken })
  response.cookies.set(env.AUTH_COOKIE_NAME, value, cleanOpts as typeof opts)
}

export function clearAuthCookiesOnResponse(response: {
  cookies: { set: (name: string, value: string, opts?: object) => void }
}) {
  const opts = getAuthCookieOptions({ maxAge: 0 })
  const cleanOpts = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
  response.cookies.set(env.AUTH_COOKIE_NAME, '', { ...cleanOpts, maxAge: 0 } as typeof opts)
}

function parseServerAuthCookie(value: string | undefined): {
  token: string | null
  refreshToken: string | null
} {
  if (!value) return { token: null, refreshToken: null }
  try {
    const parsed = JSON.parse(value) as unknown
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
  return { token: null, refreshToken: null }
}

export async function getServerAuthToken() {
  const cookieStore = await cookies()
  const { token } = parseServerAuthCookie(cookieStore.get(env.AUTH_COOKIE_NAME)?.value)
  return { token }
}

export async function getServerRefreshToken() {
  const cookieStore = await cookies()
  const { refreshToken } = parseServerAuthCookie(cookieStore.get(env.AUTH_COOKIE_NAME)?.value)
  return { refreshToken }
}

export async function refreshTokensFromCookie(): Promise<SetAuthCookiesInput | null> {
  const { refreshToken } = await getServerRefreshToken()
  if (!refreshToken) return null
  return refreshTokensWithRefreshToken({ refreshToken })
}

export async function refreshTokensWithRefreshToken({
  refreshToken,
}: {
  refreshToken: string
}): Promise<SetAuthCookiesInput | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/session/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { token?: string; refreshToken?: string }
    if (typeof data?.token !== 'string' || typeof data?.refreshToken !== 'string') return null
    return { token: data.token, refreshToken: data.refreshToken }
  } catch {
    return null
  }
}
