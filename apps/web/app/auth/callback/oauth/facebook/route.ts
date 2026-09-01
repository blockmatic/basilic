import { createClient } from '@repo/core'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { completeOAuthCallback } from '@/lib/auth/callback-utils'
import { parseAuthCookie } from '@/lib/auth/parse-auth-cookie'
import { env } from '@/lib/env'

function mapAuthError(raw: string): string {
  const known: Record<string, string> = {
    'Invalid or expired state': 'facebook_invalid_state',
    'State has expired': 'facebook_expired_state',
    'Failed to exchange code for token': 'facebook_token_exchange_failed',
    'Failed to fetch Facebook user': 'facebook_fetch_user_failed',
    'Could not retrieve email from Facebook': 'facebook_email_required',
    'Facebook OAuth is not configured': 'facebook_oauth_not_configured',
    'Facebook sign-in failed': 'facebook_oauth_failed',
  }
  return known[raw] ?? 'facebook_oauth_failed'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state)
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent('missing_params')}`, request.url),
      303,
    )

  const cookieStore = await cookies()
  const { token } = parseAuthCookie(cookieStore.get(env.NEXT_PUBLIC_AUTH_COOKIE_NAME)?.value)
  const client = createClient({
    baseUrl: env.NEXT_PUBLIC_API_URL,
    ...(token && {
      getAuthToken: () => token,
      getRefreshToken: () => null,
      onTokensRefreshed: async () => {},
    }),
  })

  try {
    const response = await client.auth.oauth.facebook.exchange({
      body: { code, state },
      throwOnError: true,
    })
    return completeOAuthCallback({
      request,
      response,
      failureMessage: 'facebook_oauth_failed',
    })
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Facebook sign-in failed'
    const errorCode = mapAuthError(rawMessage)
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(errorCode)}`, request.url),
      303,
    )
  }
}
