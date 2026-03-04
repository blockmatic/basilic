import { decodeJwt } from 'jose'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

export const authCookieName = 'better-auth.jwt_token'
export const authRefreshCookieName = 'better-auth.refresh_token'

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
  try {
    const decoded = decodeJwt(refreshToken) as { exp?: number }
    if (!decoded?.exp) return 604800
    return Math.max(0, Math.floor(decoded.exp - Date.now() / 1000))
  } catch {
    return 604800
  }
}

export type SetAuthCookiesInput = {
  token: string
  refreshToken: string
}

/** Cookie store with set method (Route Handlers, Server Actions) */
type WritableCookieStore = {
  set: (name: string, value: string, opts?: object) => void
}

export function setAuthCookiesViaHeaders(
  cookieStore: WritableCookieStore,
  { token, refreshToken }: SetAuthCookiesInput,
) {
  const maxAge = getMaxAgeFromRefreshToken(refreshToken)
  const opts = getAuthCookieOptions({ maxAge })
  const cleanOpts = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
  cookieStore.set(authCookieName, token, cleanOpts)
  cookieStore.set(authRefreshCookieName, refreshToken, cleanOpts)
}

export function setAuthCookiesOnResponse(
  response: { cookies: { set: (name: string, value: string, opts?: object) => void } },
  { token, refreshToken }: SetAuthCookiesInput,
) {
  const maxAge = getMaxAgeFromRefreshToken(refreshToken)
  const opts = getAuthCookieOptions({ maxAge })
  const cleanOpts = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
  response.cookies.set(authCookieName, token, cleanOpts as typeof opts)
  response.cookies.set(authRefreshCookieName, refreshToken, cleanOpts as typeof opts)
}

export function clearAuthCookiesOnResponse(response: {
  cookies: { set: (name: string, value: string, opts?: object) => void }
}) {
  const opts = getAuthCookieOptions({ maxAge: 0 })
  const cleanOpts = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
  response.cookies.set(authCookieName, '', cleanOpts as typeof opts)
  response.cookies.set(authRefreshCookieName, '', cleanOpts as typeof opts)
}

export async function getServerAuthToken() {
  const cookieStore = await cookies()
  return { token: cookieStore.get(authCookieName)?.value ?? null }
}

export async function setServerAuthToken({ token }: { token: string }) {
  const cookieStore = await cookies()
  cookieStore.set(authCookieName, token, getAuthCookieOptions({}))
  return { token }
}

export async function clearServerAuthToken() {
  const cookieStore = await cookies()
  cookieStore.set(authCookieName, '', getAuthCookieOptions({ maxAge: 0 }))
  return { cleared: true }
}

export async function getServerRefreshToken() {
  const cookieStore = await cookies()
  return { refreshToken: cookieStore.get(authRefreshCookieName)?.value ?? null }
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

export async function setServerRefreshToken({ refreshToken }: { refreshToken: string }) {
  const cookieStore = await cookies()
  cookieStore.set(authRefreshCookieName, refreshToken, getAuthCookieOptions({}))
  return { refreshToken }
}

export async function clearServerRefreshToken() {
  const cookieStore = await cookies()
  cookieStore.set(authRefreshCookieName, '', getAuthCookieOptions({ maxAge: 0 }))
  return { cleared: true }
}
