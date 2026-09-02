import { env } from '../env.js'

export function getWebAuthnRpName(): string {
  const rpName = env.WEBAUTHN_RP_NAME?.trim() || env.APP_NAME
  if (!rpName) throw new Error('WebAuthn RP name is required: set WEBAUTHN_RP_NAME or APP_NAME')
  return rpName
}

/**
 * Parses Origin header and validates against ALLOWED_ORIGINS.
 * Returns rpID (hostname) and expectedOrigin for WebAuthn.
 */
export function getWebAuthnOriginFromRequest(originHeader: string | undefined): {
  rpID: string
  expectedOrigin: string
} | null {
  if (!originHeader || typeof originHeader !== 'string' || originHeader.trim().length === 0)
    return null

  const trimmed = originHeader.trim()
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

  if (parsed.protocol === 'http:') {
    const host = parsed.hostname.toLowerCase()
    const allowedHosts = ['localhost', '127.0.0.1', '::1', '[::1]']
    if (!allowedHosts.includes(host)) return null
  }

  const allowed = env.ALLOWED_ORIGINS
  if (!allowed.includes('*') && !allowed.includes(parsed.origin)) return null

  return {
    rpID: parsed.hostname,
    expectedOrigin: parsed.origin,
  }
}
