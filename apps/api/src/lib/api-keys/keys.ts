import { randomBytes } from 'node:crypto'
import { generateToken, hashToken } from '../jwt.js'

const prefixLength = 8 // 6 bytes base64url = 8 chars

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
  if (afterBask.length <= prefixLength + 1 || afterBask[prefixLength] !== '_') return null

  const prefix = afterBask.slice(0, prefixLength)
  const secret = afterBask.slice(prefixLength + 1)
  if (!secret) return null
  return { prefix, secret }
}
