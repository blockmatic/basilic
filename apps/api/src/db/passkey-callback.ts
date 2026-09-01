import { decryptCallbackTokens, encryptCallbackTokens } from './callback-tokens.js'
import type { PasskeyCallback } from './schema/tables/passkey-callback.js'

export function encryptPasskeyTokens(payload: { accessToken: string; refreshToken: string }): {
  accessToken: string
  refreshToken: string
} {
  return encryptCallbackTokens(payload)
}

export function decryptPasskeyTokens(record: PasskeyCallback): PasskeyCallback {
  const decrypted = decryptCallbackTokens(record)
  if (!decrypted)
    throw new Error('Passkey token decryption failed: accessToken could not be decrypted')
  return {
    ...record,
    accessToken: decrypted.accessToken,
    refreshToken: decrypted.refreshToken,
  }
}
