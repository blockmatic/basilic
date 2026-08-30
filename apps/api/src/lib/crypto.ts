import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { env } from './env.js'

/**
 * Encryption algorithm: AES-256-GCM
 * - Provides authenticated encryption with associated data
 * - IV/nonce: 12 bytes (GCM standard)
 * - Authentication tag: 16 bytes (included in encrypted payload)
 */
const algorithm = 'aes-256-gcm'
const ivLength = 12
const authTagLength = 16

/**
 * Gets the encryption key as a Buffer from ENCRYPTION_KEY env var
 * ENCRYPTION_KEY is a 64-character hex string (32 bytes)
 */
function getEncryptionKey(): Buffer {
  return Buffer.from(env.ENCRYPTION_KEY, 'hex')
}

const weakEncryptionKey = '0'.repeat(64)

/**
 * Validates that ENCRYPTION_KEY is properly configured.
 * In production, rejects the all-zero default.
 */
export function validateEncryptionKey(): void {
  const key = env.ENCRYPTION_KEY
  if (key?.length !== 64 || !/^[0-9a-fA-F]+$/.test(key))
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')

  if (env.NODE_ENV === 'production' && key === weakEncryptionKey)
    throw new Error('ENCRYPTION_KEY must not be the all-zero default in production')
}

/**
 * Encrypts plaintext using AES-256-GCM
 *
 * Payload format: [IV (12 bytes)][AuthTag (16 bytes)][Ciphertext] → base64
 *
 * @param plaintext - The plaintext string to encrypt
 * @returns Base64-encoded encrypted string, or null on error
 */
export function encrypt(plaintext: string): string | null {
  if (!plaintext) return null

  try {
    const key = getEncryptionKey()
    const iv = randomBytes(ivLength)
    const cipher = createCipheriv(algorithm, key, iv)

    let encrypted = cipher.update(plaintext, 'utf8')
    encrypted = Buffer.concat([encrypted, cipher.final()])

    const authTag = cipher.getAuthTag()

    // Combine IV + AuthTag + Ciphertext
    const payload = Buffer.concat([iv, authTag, encrypted])

    // Return as base64 string
    return payload.toString('base64')
  } catch {
    // Don't expose encryption errors that could leak key info
    return null
  }
}

/**
 * Decrypts a base64-encoded encrypted string using AES-256-GCM
 *
 * @param ciphertext - Base64-encoded encrypted string
 * @returns Decrypted plaintext string, or null on failure
 */
export function decrypt(ciphertext: string): string | null {
  if (!ciphertext) return null

  try {
    const key = getEncryptionKey()
    const payload = Buffer.from(ciphertext, 'base64')

    // Extract IV, AuthTag, and Ciphertext
    if (payload.length < ivLength + authTagLength) return null

    const iv = payload.subarray(0, ivLength)
    const authTag = payload.subarray(ivLength, ivLength + authTagLength)
    const encrypted = payload.subarray(ivLength + authTagLength)

    const decipher = createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString('utf8')
  } catch {
    // Don't expose decryption errors that could leak key info
    return null
  }
}
