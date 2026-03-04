const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_token: 'Invalid or expired magic link',
  expired_token: 'Magic link has expired',
  failed_verify: 'Failed to verify magic link',
  token_not_found: 'Magic link not found',
  missing_params: 'Invalid sign-in link - missing parameters',
  invalid_state: 'Invalid or expired sign-in session. Please try again.',
  expired_state: 'Sign-in session expired. Please try again.',
  token_exchange_failed: 'GitHub sign-in failed. Please try again.',
  fetch_user_failed: 'Could not load your GitHub profile. Please try again.',
  email_required: 'No verified email found. Please add a verified email to your GitHub account.',
  oauth_not_configured: 'Sign-in is temporarily unavailable.',
  oauth_failed: 'GitHub sign-in failed. Please try again.',
  unexpected_error: 'Something went wrong. Please try again.',
}

export function getAuthErrorMessage(errorCode: string | undefined): string | undefined {
  if (!errorCode) return undefined
  const key = errorCode.toLowerCase().trim()
  return AUTH_ERROR_MESSAGES[key] ?? 'An error occurred'
}
