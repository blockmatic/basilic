import { generate, generateSecret, generateURI, verify } from 'otplib'
import QRCode from 'qrcode'
import { decrypt, encrypt } from './crypto.js'
import { env } from './env.js'

export function generateTotpSecret(): string {
  return generateSecret()
}

export function generateTotpUri({
  secret,
  issuer,
  label,
}: {
  secret: string
  issuer: string
  label: string
}): string {
  return generateURI({
    issuer,
    label,
    secret,
  })
}

export async function generateTotpCode(secret: string): Promise<string> {
  return generate({ secret })
}

export async function verifyTotpCode({
  secret,
  token,
}: {
  secret: string
  token: string
}): Promise<boolean> {
  const result = await verify({ secret, token, epochTolerance: 30 })
  return result.valid
}

export async function getTotpQrDataUrl(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri, { width: 200, margin: 2 })
}

export function encryptTotpSecret(secret: string): string | null {
  return encrypt(secret)
}

export function decryptTotpSecret(encrypted: string): string | null {
  return decrypt(encrypted)
}

export function getTotpIssuer(): string {
  const issuer = env.TOTP_ISSUER ?? env.JWT_ISSUER
  if (!issuer || typeof issuer !== 'string')
    throw new Error('TOTP issuer is required: set TOTP_ISSUER or JWT_ISSUER in environment')
  return issuer
}
