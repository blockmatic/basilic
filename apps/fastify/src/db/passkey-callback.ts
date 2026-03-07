import { decrypt, encrypt } from '../lib/crypto.js'
import type { PasskeyCallback } from './schema/tables/passkey-callback.js'

export function encryptPasskeyTokens(payload: { accessToken: string; refreshToken: string }): {
  accessToken: string
  refreshToken: string
} {
  const accessEncrypted = encrypt(payload.accessToken)
  const refreshEncrypted = encrypt(payload.refreshToken)
  if (!accessEncrypted || !refreshEncrypted) throw new Error('Passkey token encryption failed')
  return { accessToken: accessEncrypted, refreshToken: refreshEncrypted }
}

export function decryptPasskeyTokens(record: PasskeyCallback): PasskeyCallback {
  const accessDecrypted = decrypt(record.accessToken)
  const refreshDecrypted = decrypt(record.refreshToken)
  return {
    ...record,
    accessToken: accessDecrypted ?? record.accessToken,
    refreshToken: refreshDecrypted ?? record.refreshToken,
  }
}
