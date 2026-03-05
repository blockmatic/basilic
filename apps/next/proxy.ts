import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { refreshTokensWithRefreshToken, setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { isTokenExpired } from '@/lib/auth/jwt-utils'
import { parseAuthCookie } from '@/lib/auth/parse-auth-cookie'
import { env } from '@/lib/env'

const cookieName = env.NEXT_PUBLIC_AUTH_COOKIE_NAME

type AuthStatus = 'authenticated' | 'unauthenticated' | 'refreshed'

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
    const { decodeJwtToken } = await import('@/lib/auth/jwt-utils')
    const jwtDecoded = decodeJwtToken({ token })
    if (jwtDecoded?.typ !== 'access' || !jwtDecoded?.sub || !jwtDecoded?.sid)
      return { status: 'unauthenticated', shouldClearCookies: true }

    if (!isTokenExpired({ token })) return { status: 'authenticated', shouldClearCookies: false }

    if (!refreshToken) return { status: 'unauthenticated', shouldClearCookies: true }

    try {
      const tokens = await refreshTokensWithRefreshToken({ refreshToken })

      if (!tokens) return { status: 'unauthenticated', shouldClearCookies: true }

      const response = NextResponse.next()
      setAuthCookiesOnResponse(response, tokens)
      return { status: 'refreshed', response, shouldClearCookies: false }
    } catch {
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

  // Allow callbacks, logout, and explicitly listed image assets without auth
  if (pathname.startsWith('/auth/callback') || pathname === '/auth/logout' || isAllowedImage)
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
