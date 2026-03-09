import { createClient } from '@repo/core'
import { redirect, unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { extractTokens } from '@/lib/auth/callback-utils'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

function mapAuthError(raw: string): string {
  const known: Record<string, string> = {
    'Invalid or expired state': 'invalid_state',
    'State has expired': 'expired_state',
    'Failed to exchange code for token': 'token_exchange_failed',
    'Failed to fetch Facebook user': 'fetch_user_failed',
    'Could not retrieve email from Facebook': 'email_required',
    'Facebook OAuth is not configured': 'oauth_not_configured',
    'Facebook sign-in failed': 'oauth_failed',
  }
  return known[raw] ?? 'oauth_failed'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) redirect(`/auth/login?message=${encodeURIComponent('missing_params')}`)

  try {
    const response = await client.auth.oauth.facebook.exchange({ body: { code, state } })
    const tokens = extractTokens(response)
    if (!tokens) redirect(`/auth/login?message=${encodeURIComponent('oauth_failed')}`)

    const redirectResponse = NextResponse.redirect(new URL('/', request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (error) {
    unstable_rethrow(error)
    const rawMessage = error instanceof Error ? error.message : 'Facebook sign-in failed'
    const errorCode = mapAuthError(rawMessage)
    redirect(`/auth/login?message=${encodeURIComponent(errorCode)}`)
  }
}
