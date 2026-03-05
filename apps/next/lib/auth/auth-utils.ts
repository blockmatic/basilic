import { env } from '@/lib/env'
import { getServerAuthToken } from './auth-server'
import { decodeJwtToken, isTokenExpired } from './jwt-utils'

export { decodeJwtToken, isTokenExpired } from './jwt-utils'

export async function getAuthStatus() {
  const { token } = await getServerAuthToken()

  if (!token) return { authenticated: false, userId: null, sessionId: null }

  const decoded = decodeJwtToken({ token })
  if (!decoded || decoded.typ !== 'access' || !decoded.sub || !decoded.sid)
    return { authenticated: false, userId: null, sessionId: null }

  if (isTokenExpired({ token })) return { authenticated: false, userId: null, sessionId: null }

  return {
    authenticated: true,
    userId: decoded.sub,
    sessionId: decoded.sid,
  }
}

export async function getUserInfo() {
  const { token } = await getServerAuthToken()
  if (!token) return null

  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/session/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) return null

    const data = (await response.json()) as {
      user?: { email?: string | null; name?: string | null; emailVerified?: boolean | null }
    }
    return data.user ?? null
  } catch {
    return null
  }
}
