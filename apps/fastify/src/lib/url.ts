import { logger } from '@repo/utils/logger/server'
import { env } from './env.js'

/**
 * Validates URL against ALLOWED_ORIGINS: absolute http/https only, origin must be allowlisted.
 * When ALLOWED_ORIGINS includes "*", any valid http(s) URL passes.
 */
export function isAllowedUrl(url: string): boolean {
  if (typeof url !== 'string' || url.trim().length === 0) {
    logger.warn({ url: '[empty]' }, 'isAllowedUrl: empty or missing URL')
    return false
  }

  const trimmed = url.trim()
  if (trimmed.startsWith('/') || !trimmed.includes(':')) {
    logger.warn({ url: trimmed }, 'isAllowedUrl: relative URL not allowed')
    return false
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    logger.warn({ url: trimmed }, 'isAllowedUrl: invalid URL format')
    return false
  }

  const scheme = parsed.protocol.replace(/:$/, '')
  if (scheme !== 'http' && scheme !== 'https') {
    logger.warn({ url: trimmed, scheme }, 'isAllowedUrl: non-HTTP(S) scheme rejected')
    return false
  }

  const allowed = env.ALLOWED_ORIGINS
  if (allowed.includes('*')) return true

  const origin = parsed.origin
  const ok = allowed.includes(origin)
  if (!ok) {
    logger.warn({ url: trimmed, origin, allowed }, 'isAllowedUrl: origin not in allowlist')
  }
  return ok
}

/**
 * Appends an authorization code to a callback URL, placing it in the query string
 * before any existing fragment. When callbackUrl has a fragment (e.g. #section),
 * the code must be in the query so the server receives it; fragments are not
 * sent in HTTP requests.
 */
export function appendCodeToCallbackUrl(callbackUrl: string, code: string): string {
  const hashIndex = callbackUrl.indexOf('#')
  const base = hashIndex >= 0 ? callbackUrl.slice(0, hashIndex) : callbackUrl
  const fragment = hashIndex >= 0 ? callbackUrl.slice(hashIndex + 1) : ''
  const separator = base.includes('?') ? '&' : '?'
  const encodedCode = encodeURIComponent(code)
  const withCode = `${base}${separator}code=${encodedCode}`
  return fragment ? `${withCode}#${fragment}` : withCode
}
