import { env } from '@/lib/env.js'

export function validateCallbackUrl(callbackUrl: string): boolean {
  if (!callbackUrl || typeof callbackUrl !== 'string') {
    return false
  }

  try {
    const url = new URL(callbackUrl)

    // If allowlist is configured, check against it
    if (env.MAGIC_LINK_CALLBACK_HOST_ALLOWLIST) {
      return env.MAGIC_LINK_CALLBACK_HOST_ALLOWLIST.includes(url.host)
    }

    // Default: allow http/https only (no javascript:, data:, etc.)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
