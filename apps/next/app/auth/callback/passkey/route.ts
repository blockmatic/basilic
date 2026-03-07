import { createClient } from '@repo/core'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { extractTokens } from '@/lib/auth/callback-utils'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const callbackUrl = searchParams.get('callbackUrl')?.startsWith('/')
    ? searchParams.get('callbackUrl')
    : null

  if (!code) redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)

  try {
    const origin = new URL(request.url).origin
    const response = await client.auth.passkey.exchange({ body: { code, origin } })
    const tokens = extractTokens(response)
    if (!tokens) redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)

    const redirectUrl = callbackUrl ?? '/'
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch {
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`, request.url),
      303,
    )
  }
}
