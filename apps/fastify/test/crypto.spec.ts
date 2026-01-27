import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { decryptAccountTokens, encryptAccountTokens } from '../src/db/account.js'
import { getDb } from '../src/db/index.js'
import { account, users } from '../src/db/schema/index.js'
import { decrypt, encrypt, validateEncryptionKey } from '../src/lib/crypto.js'
import { cleanupGroupDatabase, setupGroupDatabase } from './utils/db-setup.js'

describe('Crypto Utility', () => {
  describe('validateEncryptionKey', () => {
    it('should not throw when ENCRYPTION_KEY is valid', () => {
      expect(() => validateEncryptionKey()).not.toThrow()
    })
  })

  describe('encrypt', () => {
    it('should encrypt plaintext and return base64 string', () => {
      const plaintext = 'test-token-12345'
      const encrypted = encrypt(plaintext)

      expect(encrypted).toBeTruthy()
      expect(typeof encrypted).toBe('string')
      expect(encrypted).not.toBe(plaintext)
      // Base64 strings don't contain spaces and have specific character set
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/)
    })

    it('should return null for empty string', () => {
      expect(encrypt('')).toBeNull()
    })

    it('should return null for null input', () => {
      expect(encrypt(null as unknown as string)).toBeNull()
    })

    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'same-token'
      const encrypted1 = encrypt(plaintext)
      const encrypted2 = encrypt(plaintext)

      expect(encrypted1).not.toBe(encrypted2)
      // But both should decrypt to the same value
      expect(encrypted1).toBeTruthy()
      expect(encrypted2).toBeTruthy()
      expect(decrypt(encrypted1)).toBe(plaintext)
      expect(decrypt(encrypted2)).toBe(plaintext)
    })

    it('should handle various token lengths', () => {
      const tokens = [
        'short',
        'a'.repeat(100),
        'a'.repeat(1000),
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
      ]

      for (const token of tokens) {
        const encrypted = encrypt(token)
        expect(encrypted).toBeTruthy()
        if (encrypted) {
          const decrypted = decrypt(encrypted)
          expect(decrypted).toBe(token)
        }
      }
    })
  })

  describe('decrypt', () => {
    it('should decrypt encrypted string back to plaintext', () => {
      const plaintext = 'test-token-12345'
      const encrypted = encrypt(plaintext)
      expect(encrypted).toBeTruthy()
      if (encrypted) {
        const decrypted = decrypt(encrypted)
        expect(decrypted).toBe(plaintext)
      }
    })

    it('should return null for empty string', () => {
      expect(decrypt('')).toBeNull()
    })

    it('should return null for invalid base64', () => {
      expect(decrypt('not-valid-base64!!!')).toBeNull()
    })

    it('should return null for too short payload', () => {
      // Payload needs at least IV (12) + AuthTag (16) = 28 bytes
      const shortPayload = Buffer.from('short').toString('base64')
      expect(decrypt(shortPayload)).toBeNull()
    })

    it('should return null for corrupted ciphertext', () => {
      const plaintext = 'test-token'
      const encrypted = encrypt(plaintext)
      expect(encrypted).toBeTruthy()
      if (!encrypted) return
      // Corrupt the ciphertext by changing a character
      const corrupted = `${encrypted.slice(0, -5)}XXXXX`
      expect(decrypt(corrupted)).toBeNull()
    })

    it('should return null for invalid auth tag (simulated wrong key)', () => {
      const plaintext = 'test-token'
      const encrypted = encrypt(plaintext)
      expect(encrypted).toBeTruthy()
      if (!encrypted) return

      // Corrupt the auth tag portion of the encrypted payload
      // This simulates what would happen with a wrong key (auth tag validation fails)
      const payload = Buffer.from(encrypted, 'base64')
      // Auth tag starts at byte 12 (after IV) and is 16 bytes long
      // Corrupt the first byte of the auth tag
      payload[12] = (payload[12] + 1) % 256
      const corrupted = payload.toString('base64')

      // Decryption should fail due to invalid auth tag
      expect(decrypt(corrupted)).toBeNull()
    })
  })

  describe('encrypt/decrypt roundtrip', () => {
    it('should successfully encrypt and decrypt OAuth tokens', () => {
      const tokens = [
        'ya29.a0AfH6SMBx...',
        '1//0abcdefghijklmnop',
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
      ]

      for (const token of tokens) {
        const encrypted = encrypt(token)
        expect(encrypted).toBeTruthy()
        if (!encrypted) continue

        const decrypted = decrypt(encrypted)
        expect(decrypted).toBe(token)
      }
    })
  })
})

describe('Account Token Encryption', () => {
  beforeAll(async () => {
    await setupGroupDatabase()
  })

  afterAll(async () => {
    await cleanupGroupDatabase()
  })

  describe('encryptAccountTokens', () => {
    it('should encrypt all token fields', () => {
      const accountData = {
        id: 'test-account-1',
        userId: 'test-user-1',
        accountId: 'oauth-123',
        providerId: 'google',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        idToken: 'id-token-789',
      }

      const encrypted = encryptAccountTokens(accountData)

      expect(encrypted.accessToken).not.toBe(accountData.accessToken)
      expect(encrypted.refreshToken).not.toBe(accountData.refreshToken)
      expect(encrypted.idToken).not.toBe(accountData.idToken)

      // Other fields should remain unchanged
      expect(encrypted.id).toBe(accountData.id)
      expect(encrypted.userId).toBe(accountData.userId)
      expect(encrypted.accountId).toBe(accountData.accountId)
      expect(encrypted.providerId).toBe(accountData.providerId)
    })

    it('should handle partial account data', () => {
      const partialData = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      }

      const encrypted = encryptAccountTokens(partialData)

      expect(encrypted.accessToken).not.toBe(partialData.accessToken)
      expect(encrypted.refreshToken).not.toBe(partialData.refreshToken)
    })

    it('should skip null/undefined fields', () => {
      const accountData = {
        id: 'test-account-1',
        userId: 'test-user-1',
        accountId: 'oauth-123',
        providerId: 'google',
        accessToken: 'access-token-123',
        refreshToken: null,
        idToken: undefined,
      }

      const encrypted = encryptAccountTokens(accountData)

      expect(encrypted.accessToken).not.toBe(accountData.accessToken)
      expect(encrypted.refreshToken).toBeNull()
      expect(encrypted.idToken).toBeUndefined()
    })
  })

  describe('decryptAccountTokens', () => {
    it('should decrypt all token fields', () => {
      const accountData = {
        id: 'test-account-1',
        userId: 'test-user-1',
        accountId: 'oauth-123',
        providerId: 'google',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        idToken: 'id-token-789',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const encrypted = encryptAccountTokens(accountData)
      const decrypted = decryptAccountTokens(encrypted as typeof accountData)

      expect(decrypted.accessToken).toBe(accountData.accessToken)
      expect(decrypted.refreshToken).toBe(accountData.refreshToken)
      expect(decrypted.idToken).toBe(accountData.idToken)

      // Other fields should remain unchanged
      expect(decrypted.id).toBe(accountData.id)
      expect(decrypted.userId).toBe(accountData.userId)
    })

    it('should handle null/undefined fields', () => {
      const accountData = {
        id: 'test-account-1',
        userId: 'test-user-1',
        accountId: 'oauth-123',
        providerId: 'google',
        accessToken: 'access-token-123',
        refreshToken: null,
        idToken: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const encrypted = encryptAccountTokens(accountData)
      const decrypted = decryptAccountTokens(encrypted as typeof accountData)

      expect(decrypted.accessToken).toBe(accountData.accessToken)
      expect(decrypted.refreshToken).toBeNull()
      expect(decrypted.idToken).toBeUndefined()
    })
  })

  describe('Account Database Integration', () => {
    it('should encrypt tokens on insert and decrypt on select', async () => {
      const db = await getDb()

      // Create a test user first (required foreign key)
      const [user] = await db
        .insert(users)
        .values({
          id: 'test-user-crypto',
          email: 'crypto-test@example.com',
        })
        .returning()

      const accountData = {
        id: 'test-account-crypto',
        userId: user.id,
        accountId: 'oauth-crypto-123',
        providerId: 'google',
        accessToken: 'encrypted-access-token',
        refreshToken: 'encrypted-refresh-token',
        idToken: 'encrypted-id-token',
      }

      // Encrypt before insert
      const encryptedAccount = encryptAccountTokens(accountData)

      // Insert encrypted account
      const [inserted] = await db.insert(account).values(encryptedAccount).returning()

      // Verify tokens are encrypted in database
      expect(inserted.accessToken).not.toBe(accountData.accessToken)
      expect(inserted.refreshToken).not.toBe(accountData.refreshToken)
      expect(inserted.idToken).not.toBe(accountData.idToken)

      // Select and decrypt
      const [selected] = await db
        .select()
        .from(account)
        .where(eq(account.id, 'test-account-crypto'))
        .limit(1)

      expect(selected).toBeTruthy()
      if (!selected) return

      const decrypted = decryptAccountTokens(selected)

      // Verify tokens are decrypted
      expect(decrypted.accessToken).toBe(accountData.accessToken)
      expect(decrypted.refreshToken).toBe(accountData.refreshToken)
      expect(decrypted.idToken).toBe(accountData.idToken)

      // Cleanup
      await db.delete(account).where(eq(account.id, 'test-account-crypto'))
      await db.delete(users).where(eq(users.id, 'test-user-crypto'))
    })
  })
})
