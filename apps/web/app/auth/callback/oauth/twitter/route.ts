import { cookies } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { createBffClient, logAuthBffFailure } from '@/lib/auth/bff-client'
import { extractTokens, getOAuthRedirectTarget } from '@/lib/auth/callback-utils'
import { parseAuthCookie } from '@/lib/auth/parse-auth-cookie'
import { env } from '@/lib/env'

function mapAuthError(raw: string): string {
  const known: Record<string, string> = {
    'Invalid or expired state': 'invalid_state',
    'State has expired': 'expired_state',
    'Missing code verifier for Twitter PKCE': 'invalid_state',
    'Failed to exchange code for token': 'token_exchange_failed',
    'Failed to fetch Twitter user': 'fetch_user_failed',
    'Invalid Twitter user response': 'fetch_user_failed',
    'Twitter OAuth is not configured': 'oauth_not_configured',
    'Twitter sign-in failed': 'oauth_failed',
  }
  return known[raw] ?? 'oauth_failed'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) redirect(`/auth/login?message=${encodeURIComponent('missing_params')}`)

  const cookieStore = await cookies()
  const { token } = parseAuthCookie(cookieStore.get(env.NEXT_PUBLIC_AUTH_COOKIE_NAME)?.value)
  const { client, reqId } = createBffClient({ request, token })

  try {
    const response = await client.auth.oauth.twitter.exchange({
      body: { code, state },
      throwOnError: true,
    })
    const tokens = extractTokens(response)
    if (!tokens) return redirect(`/auth/login?message=${encodeURIComponent('oauth_failed')}`)

    const redirectResponse = NextResponse.redirect(
      new URL(getOAuthRedirectTarget(response), request.url),
      303,
    )
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (error) {
    unstable_rethrow(error)
    logAuthBffFailure({ error, reqId, method: 'oauth_twitter' })
    const rawMessage = error instanceof Error ? error.message : 'Twitter sign-in failed'
    const errorCode = mapAuthError(rawMessage)
    redirect(`/auth/login?message=${encodeURIComponent(errorCode)}`)
  }
}
