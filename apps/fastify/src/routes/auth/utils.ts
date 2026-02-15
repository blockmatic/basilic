export function validateCallbackUrl(callbackUrl: string): boolean {
  return typeof callbackUrl === 'string' && callbackUrl.length > 0
}
