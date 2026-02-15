export function validateCallbackUrl(callbackUrl: string): boolean {
  if (!callbackUrl || typeof callbackUrl !== 'string') return false
  try {
    const url = new URL(callbackUrl)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
