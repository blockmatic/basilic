import { redirect, unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { capture, type SignInMethod } from '@/lib/analytics'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { createBffClient, logAuthBffFailure } from '@/lib/auth/bff-client'
import { extractTokens } from '@/lib/auth/callback-utils'
import { decodeJwtToken } from '@/lib/auth/jwt-utils'

function web3MethodFromAccessToken({ token }: { token: string }): SignInMethod | null {
  const wal = decodeJwtToken({ token })?.wal
  if (!wal || typeof wal !== 'object' || !('chain' in wal)) return null
  const chain = (wal as { chain?: unknown }).chain
  if (chain === 'eip155') return 'web3_eip155'
  if (chain === 'solana') return 'web3_solana'
  return null
}

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
    const method = web3MethodFromAccessToken({ token: tokens.token })
    if (method) capture({ name: 'auth_succeeded', method })
    return redirectResponse
  } catch (error) {
    unstable_rethrow(error)
    logAuthBffFailure({ error, reqId, method: 'web3' })
    redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)
  }
}
