import { randomBytes } from 'node:crypto'
import { generateToken, hashToken } from './jwt.js'

const PREFIX_LENGTH = 8 // 6 bytes base64url = 8 chars

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const prefix = randomBytes(6).toString('base64url')
  const secret = generateToken()
  const key = `bask_${prefix}_${secret}`
  const hash = hashToken(secret)
  return { key, prefix, hash }
}

export function parseApiKey(token: string): { prefix: string; secret: string } | null {
  if (!token.startsWith('bask_')) return null
  const afterBask = token.slice(5)
  if (afterBask.length <= PREFIX_LENGTH + 1 || afterBask[PREFIX_LENGTH] !== '_') return null

  const prefix = afterBask.slice(0, PREFIX_LENGTH)
  const secret = afterBask.slice(PREFIX_LENGTH + 1)
  if (!secret) return null
  return { prefix, secret }
}

export function hashApiKeySecret(secret: string): string {
  return hashToken(secret)
}
