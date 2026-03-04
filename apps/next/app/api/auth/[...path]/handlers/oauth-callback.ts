import { logger } from '@repo/utils/logger/server'
import { setAuthCookiesOnResponse } from 'lib/auth/auth-server'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import type { AuthProxyOptions } from './utils'
import { getRedirectUrl } from './utils'

function mapAuthError(raw: string): string {
  const known: Record<string, string> = {
    'Invalid OAuth callback - missing code or state': 'missing_params',
    'Invalid or expired state': 'INVALID_STATE',
    'State has expired': 'EXPIRED_STATE',
    'Failed to exchange code for token': 'TOKEN_EXCHANGE_FAILED',
    'Failed to fetch GitHub user': 'FETCH_USER_FAILED',
    'Could not retrieve email from GitHub': 'EMAIL_REQUIRED',
    'GitHub OAuth is not configured': 'OAUTH_NOT_CONFIGURED',
    'GitHub sign-in failed': 'oauth_failed',
  }
  return known[raw] ?? 'unexpected_error'
}

export const handleOAuthCallback = async ({ request }: Pick<AuthProxyOptions, 'request'>) => {
  const safeUrl = new URL(request.url).pathname
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')

  if (!code || !state) {
    const loginUrl = new URL('/auth/login', new URL(request.url).origin)
    loginUrl.searchParams.set('error', 'missing_params')
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
      const errorCode =
        data && typeof data === 'object' && 'code' in data && typeof data.code === 'string'
          ? data.code
          : mapAuthError(
              (data && typeof data === 'object' && 'message' in data && data.message) ||
                'GitHub sign-in failed',
            )
      logger.error(
        {
          status: response.status,
          errorCode,
          errorBody: data,
          url: safeUrl,
        },
        'handleOAuthCallback: exchange failed',
      )
      const loginUrl = new URL('/auth/login', new URL(request.url).origin)
      loginUrl.searchParams.set('error', errorCode)
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
          url: safeUrl,
        },
        'handleOAuthCallback: invalid response structure',
      )
      const loginUrl = new URL('/auth/login', new URL(request.url).origin)
      loginUrl.searchParams.set('error', 'oauth_failed')
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
    const rawMessage = error instanceof Error ? error.message : String(error)
    logger.error(
      {
        error,
        errorMessage: rawMessage,
        url: safeUrl,
      },
      'handleOAuthCallback: unexpected error',
    )
    const loginUrl = new URL('/auth/login', new URL(request.url).origin)
    loginUrl.searchParams.set('error', mapAuthError(rawMessage))
    return new Response(null, {
      status: 302,
      headers: { Location: loginUrl.toString() },
    })
  }
}
