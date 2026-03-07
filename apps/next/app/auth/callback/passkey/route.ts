import { createClient } from '@repo/core'
import { logger } from '@repo/utils/logger/server'
import { redirect, unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { extractTokens } from '@/lib/auth/callback-utils'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const rawCallbackUrl = searchParams.get('callbackUrl')
  const callbackUrl =
    typeof rawCallbackUrl === 'string' &&
    rawCallbackUrl.startsWith('/') &&
    !rawCallbackUrl.startsWith('//')
      ? rawCallbackUrl
      : null

  if (!code) redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)

  try {
    const origin = new URL(request.url).origin
    const response = await client.auth.passkey.exchange({
      body: { code },
      headers: { 'X-Callback-Origin': origin },
    })
    const tokens = extractTokens(response)
    if (!tokens) redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)

    const redirectUrl = callbackUrl ?? '/'
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (err) {
    unstable_rethrow(err)
    logger.error({ err }, 'Passkey callback exchange failed')
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`, request.url),
      303,
    )
  }
}
