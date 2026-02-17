import { logger } from '@repo/utils/logger/server'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth-server'
import { env } from '@/lib/env'
import type { AuthProxyOptions } from './utils'
import { getRedirectUrl } from './utils'

export const handleOAuthCallback = async ({ request }: Pick<AuthProxyOptions, 'request'>) => {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')

  if (!code || !state) {
    const loginUrl = new URL('/login', new URL(request.url).origin)
    loginUrl.searchParams.set('error', 'Invalid OAuth callback - missing code or state')
    return new Response(null, {
      status: 302,
      headers: { Location: loginUrl.toString() },
    })
  }

  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/oauth/github/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    })

    const data = (await response.json()) as
      | { token?: string; refreshToken?: string }
      | { code?: string; message?: string }

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && 'message' in data && data.message) ||
        'GitHub sign-in failed'
      logger.error(
        {
          status: response.status,
          errorMessage,
          errorBody: data,
          url: request.url,
        },
        'handleOAuthCallback: exchange failed',
      )
      const loginUrl = new URL('/login', new URL(request.url).origin)
      loginUrl.searchParams.set('error', errorMessage)
      return new Response(null, {
        status: 302,
        headers: { Location: loginUrl.toString() },
      })
    }

    const accessToken = 'token' in data ? data.token : undefined
    const refreshToken = 'refreshToken' in data ? data.refreshToken : undefined
    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      logger.error(
        {
          response: data,
          url: request.url,
        },
        'handleOAuthCallback: invalid response structure',
      )
      const loginUrl = new URL('/login', new URL(request.url).origin)
      loginUrl.searchParams.set('error', 'GitHub sign-in failed')
      return new Response(null, {
        status: 302,
        headers: { Location: loginUrl.toString() },
      })
    }

    const { redirectUrl } = getRedirectUrl({ request, callbackURL: null })
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, {
      token: accessToken,
      refreshToken,
    })
    return redirectResponse
  } catch (error) {
    logger.error(
      {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        url: request.url,
      },
      'handleOAuthCallback: unexpected error',
    )
    const loginUrl = new URL('/login', new URL(request.url).origin)
    loginUrl.searchParams.set('error', 'GitHub sign-in failed')
    return new Response(null, {
      status: 302,
      headers: { Location: loginUrl.toString() },
    })
  }
}
