import { env } from './env.js'

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

  const allowed = env.ALLOWED_ORIGINS
  if (!allowed.includes('*') && !allowed.includes(parsed.origin)) return null

  return {
    rpID: parsed.hostname,
    expectedOrigin: parsed.origin,
  }
}
