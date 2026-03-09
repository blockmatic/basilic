import { decodeJwt, jwtVerify } from 'jose'
import type { JwtPayload } from './auth-schemas'
import { jwtPayloadSchema } from './auth-schemas'

/** Decode without verification. Use only for non-auth cases (e.g. reading exp for cookie maxAge). */
export function decodeJwtToken({ token }: { token: string }): JwtPayload | null {
  try {
    const decoded = decodeJwt(token)
    const parsed = jwtPayloadSchema.safeParse(decoded)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export async function verifyJwtToken({
  token,
  secret,
}: {
  token: string
  secret: string
}): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    const parsed = jwtPayloadSchema.safeParse(payload)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function isTokenExpired({ token }: { token: string }): boolean {
  try {
    const parts = token.split('.')
    const payloadPart = parts[1]
    if (parts.length !== 3 || !payloadPart) return true
    const payload = JSON.parse(atob(payloadPart)) as { exp?: number }
    if (!payload?.exp) return true
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}
