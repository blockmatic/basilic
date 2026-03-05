import { decodeJwt } from 'jose'

export type DecodedJwt = {
  typ?: string
  sub?: string
  sid?: string
  exp?: number
  iat?: number
}

export function decodeJwtToken({ token }: { token: string }): DecodedJwt | null {
  try {
    return decodeJwt(token) as DecodedJwt
  } catch {
    return null
  }
}

export function isTokenExpired({ token }: { token: string }): boolean {
  const decoded = decodeJwtToken({ token })
  if (!decoded?.exp) return true
  return decoded.exp * 1000 < Date.now()
}
