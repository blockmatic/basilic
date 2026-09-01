import { decrypt, encrypt } from '../lib/crypto.js'

export function encryptCallbackTokens(payload: { accessToken: string; refreshToken: string }): {
  accessToken: string
  refreshToken: string
} {
  const accessEncrypted = encrypt(payload.accessToken)
  const refreshEncrypted = encrypt(payload.refreshToken)
  if (!accessEncrypted || !refreshEncrypted) throw new Error('Callback token encryption failed')
  return { accessToken: accessEncrypted, refreshToken: refreshEncrypted }
}

export function decryptCallbackTokens(record: {
  accessToken: string
  refreshToken: string
}): { accessToken: string; refreshToken: string } | null {
  const accessDecrypted = decrypt(record.accessToken)
  const refreshDecrypted = decrypt(record.refreshToken)
  if (!accessDecrypted || !refreshDecrypted) return null
  return { accessToken: accessDecrypted, refreshToken: refreshDecrypted }
}
