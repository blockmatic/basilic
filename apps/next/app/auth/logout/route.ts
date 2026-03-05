import { createClient } from '@repo/core'
import { NextResponse } from 'next/server'
import { clearAuthCookiesOnResponse, getServerAuthToken } from '@/lib/auth/auth-server'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

export async function GET(request: Request) {
  const { token } = await getServerAuthToken()

  if (token)
    try {
      await client.auth.session.logout({
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // Best-effort: clear cookies even if Fastify logout fails
    }

  const response = NextResponse.redirect(new URL('/', request.url), 303)
  clearAuthCookiesOnResponse(response)
  return response
}
