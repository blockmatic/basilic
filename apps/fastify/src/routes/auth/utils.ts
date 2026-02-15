import { logger } from '@repo/utils/logger/server'

/**
 * Validates callbackUrl: absolute http/https only, rejects empty/relative URLs and non-HTTP(S) schemes.
 */
export function validateCallbackUrl(callbackUrl: string): boolean {
  if (typeof callbackUrl !== 'string' || callbackUrl.trim().length === 0) {
    logger.warn({ callbackUrl: '[empty]' }, 'validateCallbackUrl: empty or missing URL')
    return false
  }

  const trimmed = callbackUrl.trim()
  if (trimmed.startsWith('/') || !trimmed.includes(':')) {
    logger.warn({ callbackUrl: trimmed }, 'validateCallbackUrl: relative URL not allowed')
    return false
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    logger.warn({ callbackUrl: trimmed }, 'validateCallbackUrl: invalid URL format')
    return false
  }

  const scheme = parsed.protocol.replace(/:$/, '')
  if (scheme !== 'http' && scheme !== 'https') {
    logger.warn(
      { callbackUrl: trimmed, scheme },
      'validateCallbackUrl: non-HTTP(S) scheme rejected',
    )
    return false
  }

  return true
}
