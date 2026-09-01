/** Backend OAuth error codes (snake_case) that map to auth-error-messages keys. */
const knownOAuthCodes = new Set([
  'missing_params',
  'invalid_state',
  'expired_state',
  'token_exchange_failed',
  'google_token_exchange_failed',
  'fetch_user_failed',
  'google_fetch_user_failed',
  'user_info_failed',
  'email_required',
  'google_email_required',
  'oauth_not_configured',
  'oauth_failed',
  'oauth_failed_google',
])

/** Fallback: map raw backend message strings to auth-error-messages keys. Provider-agnostic. */
const messageToKey: Record<string, string> = {
  'Invalid OAuth callback - missing code or state': 'missing_params',
  'Invalid or expired state': 'invalid_state',
  'State has expired': 'expired_state',
  'Failed to exchange code for token': 'token_exchange_failed',
  'Failed to fetch GitHub user': 'fetch_user_failed',
  'Failed to fetch Facebook user': 'fetch_user_failed',
  'Failed to fetch Facebook user (timeout)': 'fetch_user_failed',
  'Failed to fetch Twitter user': 'fetch_user_failed',
  'Failed to fetch Twitter user (timeout)': 'fetch_user_failed',
  'Invalid Twitter user response': 'fetch_user_failed',
  'Could not retrieve email from GitHub': 'email_required',
  'Could not retrieve email from Facebook': 'email_required',
  'Could not retrieve email from Twitter': 'email_required',
  'Could not retrieve verified email from Google': 'email_required',
  'Failed to fetch Google user': 'google_fetch_user_failed',
  'Failed to fetch Google user (timeout)': 'google_fetch_user_failed',
  'Google OAuth redirect is not configured': 'oauth_not_configured',
  'GitHub OAuth is not configured': 'oauth_not_configured',
  'Facebook OAuth is not configured': 'oauth_not_configured',
  'Twitter OAuth is not configured': 'oauth_not_configured',
  'Google OAuth is not configured': 'oauth_not_configured',
  'GitHub sign-in failed': 'oauth_failed',
  'Facebook sign-in failed': 'oauth_failed',
  'Twitter sign-in failed': 'oauth_failed',
  'Google sign-in failed': 'oauth_failed_google',
}

const authErrorMessages: Record<string, string> = {
  invalid_token: 'Invalid or expired magic link',
  expired_token: 'Magic link has expired',
  failed_verify: 'Failed to verify magic link',
  token_not_found: 'Magic link not found',
  missing_params: 'Invalid sign-in link - missing parameters',
  invalid_state: 'Invalid or expired sign-in session. Please try again.',
  expired_state: 'Sign-in session expired. Please try again.',
  token_exchange_failed: 'GitHub sign-in failed. Please try again.',
  google_token_exchange_failed: 'Google sign-in failed. Please try again.',
  fetch_user_failed: 'Could not load your GitHub profile. Please try again.',
  google_fetch_user_failed: 'Could not load your Google profile. Please try again.',
  email_required: 'No verified email found. Please add a verified email to your GitHub account.',
  google_email_required:
    'No verified email found. Please add a verified email to your Google account.',
  oauth_not_configured: 'Sign-in is temporarily unavailable.',
  oauth_failed: 'GitHub sign-in failed. Please try again.',
  oauth_failed_google: 'Google sign-in failed. Please try again.',
  facebook_invalid_state: 'Invalid or expired sign-in session. Please try again.',
  facebook_expired_state: 'Sign-in session expired. Please try again.',
  facebook_token_exchange_failed: 'Facebook sign-in failed. Please try again.',
  facebook_fetch_user_failed: 'Could not load your Facebook profile. Please try again.',
  facebook_email_required:
    'No verified email found. Please add a verified email to your Facebook account.',
  facebook_oauth_not_configured: 'Sign-in is temporarily unavailable.',
  facebook_oauth_failed: 'Facebook sign-in failed. Please try again.',
  invalid_or_expired_code: 'Invalid or expired sign-in code. Please try again.',
  invalid_code: 'Invalid code. Please try again.',
  unexpected_error: 'Something went wrong. Please try again.',
}

export function getAuthErrorMessage(errorCode: string | undefined): string | undefined {
  if (!errorCode) return undefined
  const key = errorCode.toLowerCase().trim()
  return authErrorMessages[key] ?? 'An error occurred'
}

/** Base keys that are overridden to Google-specific variants when provider is 'google'. */
const googleOverrides: Record<string, string> = {
  token_exchange_failed: 'google_token_exchange_failed',
  user_info_failed: 'google_fetch_user_failed',
  fetch_user_failed: 'google_fetch_user_failed',
  email_required: 'google_email_required',
  oauth_failed: 'oauth_failed_google',
}

/** Map API error (code or message) to auth-error-messages key for redirect. */
export function translateOAuthError(
  raw: string,
  body?: unknown,
  provider?: 'google' | 'github' | 'facebook' | 'twitter',
): string {
  const code =
    body &&
    typeof body === 'object' &&
    'code' in body &&
    typeof (body as { code: string }).code === 'string'
      ? (body as { code: string }).code.toLowerCase().trim()
      : null
  const baseKey = (code && knownOAuthCodes.has(code) ? code : null) ?? messageToKey[raw] ?? null
  if (!baseKey) return provider === 'google' ? 'oauth_failed_google' : 'oauth_failed'
  return (provider === 'google' ? googleOverrides[baseKey] : null) ?? baseKey
}
