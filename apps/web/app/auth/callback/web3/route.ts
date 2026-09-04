import { redirect, unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { createBffClient, logAuthBffFailure } from '@/lib/auth/bff-client'
import { extractTokens } from '@/lib/auth/callback-utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const callbackURL = searchParams.get('callbackURL')?.startsWith('/')
    ? searchParams.get('callbackURL')
    : null

  if (!code) redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)

  const { client, reqId } = createBffClient({ request })

  try {
    const response = await client.auth.web3.exchange({ body: { code } })
    const tokens = extractTokens(response)
    if (!tokens) redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)

    const redirectUrl = callbackURL ?? '/'
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (error) {
    unstable_rethrow(error)
    logAuthBffFailure({ error, reqId, method: 'web3' })
    redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)
  }
}
