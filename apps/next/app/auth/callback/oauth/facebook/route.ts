import { createClient } from '@repo/core'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { extractTokens, getOAuthRedirectTarget } from '@/lib/auth/callback-utils'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

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

  try {
    const response = await client.auth.oauth.facebook.exchange({ body: { code, state } })
    const tokens = extractTokens(response)
    if (!tokens)
      return NextResponse.redirect(
        new URL(`/auth/login?message=${encodeURIComponent('facebook_oauth_failed')}`, request.url),
        303,
      )

    const redirectResponse = NextResponse.redirect(
      new URL(getOAuthRedirectTarget(response), request.url),
      303,
    )
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Facebook sign-in failed'
    const errorCode = mapAuthError(rawMessage)
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(errorCode)}`, request.url),
      303,
    )
  }
}
