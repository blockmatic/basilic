import { decodeJwt } from 'jose'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  authCookieName,
  authRefreshCookieName,
  refreshTokensWithRefreshToken,
  setAuthCookiesOnResponse,
} from '@/lib/auth/auth-server'

const refreshCookieName = authRefreshCookieName

type AuthStatus = 'authenticated' | 'unauthenticated' | 'refreshed'

type AuthCheckResult = {
  status: AuthStatus
  response?: NextResponse
  shouldClearCookies: boolean
}

async function checkAuthStatus(request: NextRequest): Promise<AuthCheckResult> {
  const token = request.cookies.get(authCookieName)?.value
  const refreshToken = request.cookies.get(refreshCookieName)?.value

  if (!token) {
    return { status: 'unauthenticated', shouldClearCookies: false }
  }

  try {
    const decoded = decodeJwt(token) as { typ?: string; exp?: number; sub?: string; sid?: string }

    if (decoded.typ !== 'access' || !decoded.sub || !decoded.sid) {
      return { status: 'unauthenticated', shouldClearCookies: true }
    }

    const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : true

    if (!isExpired) {
      return { status: 'authenticated', shouldClearCookies: false }
    }

    if (!refreshToken) {
      return { status: 'unauthenticated', shouldClearCookies: true }
    }

    try {
      const tokens = await refreshTokensWithRefreshToken({ refreshToken })

      if (!tokens) {
        return { status: 'unauthenticated', shouldClearCookies: true }
      }

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

  // Allow callbacks, logout, and static assets without auth
  if (
    pathname.startsWith('/auth/callback') ||
    pathname === '/auth/logout' ||
    pathname.startsWith('/images/')
  ) {
    return NextResponse.next()
  }

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
      for (const header of setCookies) {
        res.headers.append('Set-Cookie', header)
      }
      return res
    }
    // Allow unauthenticated users to access login
    const response = NextResponse.next()
    if (shouldClearCookies) {
      response.cookies.delete(authCookieName)
      response.cookies.delete(refreshCookieName)
    }
    return response
  }

  if (authStatus === 'unauthenticated') {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(url)
    if (shouldClearCookies) {
      redirectResponse.cookies.delete(authCookieName)
      redirectResponse.cookies.delete(refreshCookieName)
    }
    return redirectResponse
  }

  const response = refreshResponse ?? NextResponse.next()
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
}
