import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth-server'
import { env } from '@/lib/env'

/**
 * E2E-only: set auth cookies from token in query, then redirect to /.
 * Used when browser cookie propagation from magic-link verify fails (e.g. storageState).
 */
export async function handleTestSetSession({ request }: { request: Request }) {
  if (env.ALLOW_TEST !== 'true') {
    return new Response(null, { status: 404 })
  }
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const refreshToken = url.searchParams.get('refreshToken')
  if (!token || !refreshToken) {
    return new Response(
      JSON.stringify({ code: 'BAD_REQUEST', message: 'token and refreshToken required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
  const redirectUrl = new URL('/', request.url)
  const response = NextResponse.redirect(redirectUrl, 303)
  setAuthCookiesOnResponse(response, { token, refreshToken })
  return response
}
