import { authCookieSchema } from './auth-schemas'

export function parseAuthCookie(value: string | undefined): {
  token: string | null
  refreshToken: string | null
} {
  if (!value) return { token: null, refreshToken: null }
  try {
    const parsed = authCookieSchema.safeParse(JSON.parse(value))
    return parsed.success
      ? { token: parsed.data.token, refreshToken: parsed.data.refreshToken }
      : { token: null, refreshToken: null }
  } catch {
    return { token: null, refreshToken: null }
  }
}
