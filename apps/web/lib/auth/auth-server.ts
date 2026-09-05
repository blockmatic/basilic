import { ApiError } from '@repo/core'
import { logger } from '@repo/utils/logger/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import type { AuthCookie } from './auth-schemas'
import { authCookieSchema } from './auth-schemas'
import { createBffClient } from './bff-client'
import { decodeJwtToken } from './jwt-utils'
import { parseAuthCookie } from './parse-auth-cookie'

const cookieName = env.NEXT_PUBLIC_AUTH_COOKIE_NAME

export type RefreshTokensResult =
  | { status: 'ok'; tokens: AuthCookie }
  | { status: 'invalid' }
  | { status: 'unavailable' }

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

export async function getServerAuthCookie() {
  const cookieStore = await cookies()
  return parseAuthCookie(cookieStore.get(cookieName)?.value)
}

export async function getServerAuthToken(): Promise<{ token: string | null }> {
  const { token } = await getServerAuthCookie()
  return { token }
}

export async function refreshTokensWithRefreshToken({
  refreshToken,
  request,
  reqId,
}: {
  refreshToken: string
  request?: Request
  reqId: string
}): Promise<RefreshTokensResult> {
  const { client } = createBffClient({
    request,
    extraHeaders: { 'x-request-id': reqId },
  })
  try {
    const data = await client.auth.session.refresh({ body: { refreshToken } })
    const parsed = authCookieSchema.safeParse(data)
    if (!parsed.success) return { status: 'unavailable' }
    return { status: 'ok', tokens: parsed.data }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 400) return { status: 'invalid' }
      if (error.status === 429 || error.status >= 500) return { status: 'unavailable' }
    }
    logger.warn({ reqId }, 'auth_proxy_refresh_failed')
    return { status: 'unavailable' }
  }
}
