import { decrypt, encrypt } from '../lib/crypto.js'
import type { Account, NewAccount } from './schema/tables/account.js'

/**
 * Token fields that should be encrypted at rest
 */
const ENCRYPTED_FIELDS = ['accessToken', 'refreshToken', 'idToken'] as const

/**
 * Encrypts OAuth token fields in an account object before database insert/update
 *
 * Only encrypts fields that are present and non-null.
 * Leaves other fields unchanged.
 *
 * @param account - Account data to encrypt (NewAccount or Partial<Account>)
 * @returns Account object with encrypted token fields
 */
export function encryptAccountTokens<T extends NewAccount | Partial<Account>>(account: T): T {
  const encrypted = { ...account }

  for (const field of ENCRYPTED_FIELDS) {
    const value = encrypted[field]
    if (value && typeof value === 'string') {
      const encryptedValue = encrypt(value)
      if (encryptedValue) encrypted[field] = encryptedValue as T[typeof field]
      else throw new Error(`encryption failed for field ${field}`)
    }
  }

  return encrypted
}

/**
 * Decrypts OAuth token fields in an account object after database select
 *
 * Attempts to decrypt all token fields. If decryption fails (e.g., invalid ciphertext),
 * the field remains as-is (could be plaintext during migration or corrupted data).
 *
 * @param account - Account object from database
 * @returns Account object with decrypted token fields
 */
export function decryptAccountTokens(account: Account): Account {
  const decrypted = { ...account }

  for (const field of ENCRYPTED_FIELDS) {
    const value = decrypted[field]
    if (value && typeof value === 'string') {
      const decryptedValue = decrypt(value)
      if (decryptedValue) decrypted[field] = decryptedValue

      // If decryption fails, leave as-is (could be plaintext or corrupted)
    }
  }

  return decrypted
}
