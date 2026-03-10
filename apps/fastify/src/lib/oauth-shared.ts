/** Intentionally extensible for future providers (e.g. nonce, provider-specific fields). */
export interface OAuthStateMeta {
  redirectUri?: string
  codeVerifier?: string
  userId?: string
  mode?: 'login' | 'link'
}

export type ResolveOAuthCallbackUrlResult =
  | { ok: true; defaultUrl: string; redirectUri: string; allowedUrls: string[] }
  | { ok: false; error: 'NOT_CONFIGURED' | 'INVALID_REDIRECT_URI' }

/**
 * Resolve OAuth callback URL from allowed list and optional client request.
 * defaultUrl = allowedUrls[0]. If requestedRedirectUri provided: exact string match
 * against allowedUrls; if match use it else INVALID_REDIRECT_URI. If not provided, use defaultUrl.
 */
export function resolveOAuthCallbackUrl(opts: {
  allowedUrls: string[]
  requestedRedirectUri?: string
}): ResolveOAuthCallbackUrlResult {
  const { allowedUrls, requestedRedirectUri } = opts
  if (allowedUrls.length === 0) return { ok: false, error: 'NOT_CONFIGURED' }
  const defaultUrl = allowedUrls[0]
  if (!requestedRedirectUri) return { ok: true, defaultUrl, redirectUri: defaultUrl, allowedUrls }
  const match = allowedUrls.includes(requestedRedirectUri)
  if (!match) return { ok: false, error: 'INVALID_REDIRECT_URI' }
  return { ok: true, defaultUrl, redirectUri: requestedRedirectUri, allowedUrls }
}

/** Build allowed callback URLs from env: OAUTH_*_CALLBACK_URLS (comma-separated) or OAUTH_*_CALLBACK_URL (single). */
export function getOAuthAllowedCallbackUrls(opts: {
  urls?: string[]
  singleUrl?: string
}): string[] {
  const { urls, singleUrl } = opts
  if (urls && urls.length > 0) return urls
  if (singleUrl) return [singleUrl]
  return []
}
