export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN: 'Invalid or expired magic link',
  EXPIRED_TOKEN: 'Magic link has expired',
  FAILED_VERIFY: 'Failed to verify magic link',
  TOKEN_NOT_FOUND: 'Magic link not found',
  missing_params: 'Invalid sign-in link - missing parameters',
  INVALID_STATE: 'Invalid or expired sign-in session. Please try again.',
  EXPIRED_STATE: 'Sign-in session expired. Please try again.',
  TOKEN_EXCHANGE_FAILED: 'GitHub sign-in failed. Please try again.',
  FETCH_USER_FAILED: 'Could not load your GitHub profile. Please try again.',
  EMAIL_REQUIRED: 'No verified email found. Please add a verified email to your GitHub account.',
  OAUTH_NOT_CONFIGURED: 'Sign-in is temporarily unavailable.',
  oauth_failed: 'GitHub sign-in failed. Please try again.',
  unexpected_error: 'Something went wrong. Please try again.',
}

export function getAuthErrorMessage(errorCode: string | undefined): string | undefined {
  if (!errorCode) return undefined
  return AUTH_ERROR_MESSAGES[errorCode] ?? 'An error occurred'
}
