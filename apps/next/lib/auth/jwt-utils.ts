import { decodeJwt } from 'jose'
import type { JwtPayload } from './auth-schemas'
import { jwtPayloadSchema } from './auth-schemas'

export function decodeJwtToken({ token }: { token: string }): JwtPayload | null {
  try {
    const decoded = decodeJwt(token)
    const parsed = jwtPayloadSchema.safeParse(decoded)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function isTokenExpired({ token }: { token: string }): boolean {
  const decoded = decodeJwtToken({ token })
  if (!decoded?.exp) return true
  return decoded.exp * 1000 <= Date.now()
}
