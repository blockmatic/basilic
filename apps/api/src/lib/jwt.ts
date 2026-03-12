import { createHash, randomBytes, randomInt } from 'node:crypto'
import { env } from './env.js'

type AccessTokenPayload = {
  typ: 'access'
  sub: string // userId
  sid: string // sessionId
  wal?: { chain: string; address: string } // session wallet (when JWT created by wallet)
  iss: string
  aud: string[]
  iat: number
  exp: number
}

type RefreshTokenPayload = {
  typ: 'refresh'
  sub: string // userId
  sid: string // sessionId
  jti: string // refresh token JTI
  iss: string
  aud: string[]
  iat: number
  exp: number
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

/** Returns 6-digit code (100000–999999) for magic link login. */
export function generateLoginCode(): string {
  return String(randomInt(100000, 1000000))
}

export function generateJti(): string {
  return randomBytes(16).toString('base64url')
}

export function createAccessTokenPayload({
  userId,
  sessionId,
  wallet,
}: {
  userId: string
  sessionId: string
  wallet?: { chain: string; address: string }
}): Omit<AccessTokenPayload, 'iat' | 'exp'> {
  return {
    typ: 'access',
    sub: userId,
    sid: sessionId,
    ...(wallet && { wal: wallet }),
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
  }
}

export function createRefreshTokenPayload({
  userId,
  sessionId,
  jti,
}: {
  userId: string
  sessionId: string
  jti: string
}): Omit<RefreshTokenPayload, 'iat' | 'exp'> {
  return {
    typ: 'refresh',
    sub: userId,
    sid: sessionId,
    jti,
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
  }
}

export type { AccessTokenPayload, RefreshTokenPayload }
