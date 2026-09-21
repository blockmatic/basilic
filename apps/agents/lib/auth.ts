import { getValidSession } from '@repo/db'
import {
  type AuthFn,
  extractBearerToken,
  verifyJwtHmac,
  withAuthChallenges,
} from 'eve/channels/auth'
import { env } from './env.js'

type AccessClaims = {
  typ?: string
  sub?: string
  sid?: string
}

function decodeJwtPayload(token: string): AccessClaims | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AccessClaims
  } catch {
    return null
  }
}

export function basilicAccessJwt(): AuthFn<Request> {
  return withAuthChallenges(
    async request => {
      const token = extractBearerToken(request.headers.get('authorization'))
      if (!token) return null
      const result = await verifyJwtHmac(token, {
        algorithm: 'HS256',
        issuer: env.JWT_ISSUER,
        audiences: env.JWT_AUDIENCE,
        secret: env.JWT_SECRET,
        claims: { typ: ['access'] },
      })
      if (!result.ok) return null
      const payload = decodeJwtPayload(token)
      if (!payload?.sub || !payload.sid || payload.typ !== 'access') return null
      const valid = await getValidSession({ sid: payload.sid, userId: payload.sub })
      if (!valid) return null
      return {
        attributes: { sessionId: payload.sid },
        authenticator: 'basilic-jwt',
        issuer: env.JWT_ISSUER,
        principalId: payload.sub,
        principalType: 'user',
      }
    },
    [{ scheme: 'Bearer' }],
  )
}
