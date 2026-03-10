import { z } from 'zod'
import { env } from '@/lib/env'
import { getServerAuthToken } from './auth-server'
import { isTokenExpired, verifyJwtToken } from './jwt-utils'

const userResponseSchema = z
  .object({
    user: z
      .object({
        id: z.string().optional(),
        email: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        username: z.string().nullable().optional(),
        emailVerified: z.boolean().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough()

export async function getAuthStatus(): Promise<{
  authenticated: boolean
  userId: string | null
  sessionId: string | null
}> {
  const { token } = await getServerAuthToken()

  if (!token) return { authenticated: false, userId: null, sessionId: null }

  const decoded = await verifyJwtToken({ token, secret: env.JWT_SECRET })
  if (!decoded || decoded.typ !== 'access' || !decoded.sub || !decoded.sid)
    return { authenticated: false, userId: null, sessionId: null }

  if (isTokenExpired({ token })) return { authenticated: false, userId: null, sessionId: null }

  return {
    authenticated: true,
    userId: decoded.sub,
    sessionId: decoded.sid,
  }
}

export async function getUserInfo(): Promise<{
  id?: string
  email?: string | null
  name?: string | null
  username?: string | null
  emailVerified?: boolean | null
} | null> {
  const { token } = await getServerAuthToken()
  if (!token) return null

  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/session/user`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!response.ok) return null

    const parsed = userResponseSchema.safeParse(await response.json())
    return parsed.success && parsed.data.user ? parsed.data.user : null
  } catch {
    return null
  }
}
