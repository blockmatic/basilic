import { NextResponse } from 'next/server'
import { clearAuthCookiesOnResponse, getServerAuthToken } from '@/lib/auth/auth-server'
import { createBffClient, logAuthBffFailure } from '@/lib/auth/bff-client'

export async function GET(request: Request) {
  const { token } = await getServerAuthToken()

  if (token) {
    const { client, reqId } = createBffClient({ request, token })
    try {
      await client.auth.session.logout({
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      logAuthBffFailure({ error, reqId, method: 'logout' })
    }
  }

  const response = NextResponse.redirect(new URL('/', request.url), 303)
  clearAuthCookiesOnResponse(response)
  return response
}
