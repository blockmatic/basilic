import { logger } from '@repo/utils/logger/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { refreshTokensWithRefreshToken, setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { decodeJwtToken, isTokenExpired, verifyJwtToken } from '@/lib/auth/jwt-utils'
import { parseAuthCookie } from '@/lib/auth/parse-auth-cookie'
import { resolveRequestId } from '@/lib/auth/request-id'
import { env } from '@/lib/env'

const cookieName = env.NEXT_PUBLIC_AUTH_COOKIE_NAME

type AuthStatus = 'authenticated' | 'unauthenticated' | 'refreshed' | 'unavailable'

type AuthCheckResult = {
  status: AuthStatus
  response?: NextResponse
  shouldClearCookies: boolean
}

async function checkAuthStatus(request: NextRequest): Promise<AuthCheckResult> {
  const raw = request.cookies.get(cookieName)?.value
  const { token, refreshToken } = parseAuthCookie(raw)

  if (!token) return { status: 'unauthenticated', shouldClearCookies: false }

  try {
    const payload = decodeJwtToken({ token })
    if (payload?.typ !== 'access' || !payload?.sub || !payload?.sid)
      return { status: 'unauthenticated', shouldClearCookies: true }

    if (!isTokenExpired({ token })) {
      const verified = await verifyJwtToken({
        token,
        secret: env.JWT_SECRET,
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      })
      if (verified) return { status: 'authenticated', shouldClearCookies: false }
      return { status: 'unauthenticated', shouldClearCookies: true }
    }

    if (!refreshToken) return { status: 'unauthenticated', shouldClearCookies: true }

    const reqId = resolveRequestId(request.headers)
    let result: Awaited<ReturnType<typeof refreshTokensWithRefreshToken>>
    try {
      result = await refreshTokensWithRefreshToken({ refreshToken, request, reqId })
    } catch {
      logger.warn({ reqId }, 'auth_proxy_refresh_failed')
      return { status: 'unauthenticated', shouldClearCookies: false }
    }

    if (result.status === 'unavailable') return { status: 'unavailable', shouldClearCookies: false }

    if (result.status !== 'ok') return { status: 'unauthenticated', shouldClearCookies: true }

    try {
      const response = NextResponse.next()
      setAuthCookiesOnResponse(response, result.tokens)
      return { status: 'refreshed', response, shouldClearCookies: false }
    } catch {
      logger.warn({ reqId }, 'auth_proxy_cookie_failed')
      return { status: 'unauthenticated', shouldClearCookies: true }
    }
  } catch {
    return { status: 'unauthenticated', shouldClearCookies: true }
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const allowedImagePaths = ['/images/auth-login-hero.webp'] as const
  const isAllowedImage = (allowedImagePaths as readonly string[]).includes(pathname)

  // Allow callbacks, logout, legal pages, and explicitly listed image assets without auth
  const publicPaths = ['/auth/logout', '/auth/session/revoke', '/terms', '/privacy'] as const
  if (
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/auth/session/revoke') ||
    (publicPaths as readonly string[]).includes(pathname) ||
    isAllowedImage
  )
    return NextResponse.next()

  const authCheck = await checkAuthStatus(request)
  const { status: authStatus, response: refreshResponse, shouldClearCookies } = authCheck

  // Allow /auth/login to be accessed without auth
  if (pathname === '/auth/login') {
    if (authStatus === 'authenticated') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    if (authStatus === 'refreshed' && refreshResponse) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      const res = NextResponse.redirect(url)
      const setCookies = refreshResponse.headers.getSetCookie()
      for (const header of setCookies) res.headers.append('Set-Cookie', header)

      return res
    }
    // Allow unauthenticated users to access login
    const response = NextResponse.next()
    if (shouldClearCookies) response.cookies.set(cookieName, '', { maxAge: 0, path: '/' })
    return response
  }

  if (authStatus === 'unavailable')
    return new NextResponse('Auth service unavailable', { status: 503 })

  if (authStatus === 'unauthenticated') {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(url)
    if (shouldClearCookies) redirectResponse.cookies.set(cookieName, '', { maxAge: 0, path: '/' })
    return redirectResponse
  }

  const response = refreshResponse ?? NextResponse.next()
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
}
