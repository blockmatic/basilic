import { cookies } from 'next/headers'
import { env } from '@/lib/env'

const authCookieName = 'better-auth.jwt_token'
const authRefreshCookieName = 'better-auth.refresh_token'

type AuthCookieOptions = {
  maxAge?: number
}

const getAuthCookieOptions = ({ maxAge }: AuthCookieOptions) => ({
  httpOnly: true,
  maxAge,
  path: '/',
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
})

export async function getServerAuthToken() {
  const cookieStore = await cookies()
  return { token: cookieStore.get(authCookieName)?.value ?? null }
}

export async function setServerAuthToken({ token }: { token: string }) {
  const cookieStore = await cookies()
  cookieStore.set(authCookieName, token, getAuthCookieOptions({}))
  return { token }
}

export async function clearServerAuthToken() {
  const cookieStore = await cookies()
  cookieStore.set(authCookieName, '', getAuthCookieOptions({ maxAge: 0 }))
  return { cleared: true }
}

export async function getServerRefreshToken() {
  const cookieStore = await cookies()
  return { refreshToken: cookieStore.get(authRefreshCookieName)?.value ?? null }
}

export async function setServerRefreshToken({ refreshToken }: { refreshToken: string }) {
  const cookieStore = await cookies()
  cookieStore.set(authRefreshCookieName, refreshToken, getAuthCookieOptions({}))
  return { refreshToken }
}

export async function clearServerRefreshToken() {
  const cookieStore = await cookies()
  cookieStore.set(authRefreshCookieName, '', getAuthCookieOptions({ maxAge: 0 }))
  return { cleared: true }
}
