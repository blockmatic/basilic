import { createClient } from '@repo/core'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { extractTokens } from '@/lib/auth/callback-utils'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

function mapAuthError(raw: string): string {
  const known: Record<string, string> = {
    'Invalid OAuth callback - missing code or state': 'missing_params',
    'Invalid or expired state': 'invalid_state',
    'State has expired': 'expired_state',
    'Failed to exchange code for token': 'token_exchange_failed',
    'Failed to fetch GitHub user': 'fetch_user_failed',
    'Could not retrieve email from GitHub': 'email_required',
    'GitHub OAuth is not configured': 'oauth_not_configured',
    'GitHub sign-in failed': 'oauth_failed',
  }
  return known[raw] ?? 'oauth_failed'
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
    const response = await client.auth.oauth.github.exchange({ body: { code, state } })
    const tokens = extractTokens(response)
    if (!tokens)
      return NextResponse.redirect(
        new URL(`/auth/login?message=${encodeURIComponent('oauth_failed')}`, request.url),
        303,
      )

    const redirectResponse = NextResponse.redirect(new URL('/', request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'GitHub sign-in failed'
    const errorCode = mapAuthError(rawMessage)
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(errorCode)}`, request.url),
      303,
    )
  }
}
