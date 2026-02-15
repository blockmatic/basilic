import { randomBytes } from 'node:crypto'
import { generateToken, hashToken } from './jwt.js'

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const prefix = randomBytes(6).toString('base64url')
  const secret = generateToken()
  const key = `bask_${prefix}_${secret}`
  const hash = hashToken(secret)
  return { key, prefix, hash }
}

export function parseApiKey(token: string): { prefix: string; secret: string } | null {
  if (!token.startsWith('bask_')) return null
  const segments = token.split('_')
  if (segments.length < 3) return null
  const prefix = segments[1]
  if (!prefix) return null
  const secret = segments.slice(2).join('_')
  if (!secret) return null
  return { prefix, secret }
}

export function hashApiKeySecret(secret: string): string {
  return hashToken(secret)
}
