const fetchTimeoutMs = 15_000

export interface GoogleTokenResponse {
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  access_token: string
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  token_type: string
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  expires_in?: number
  scope?: string
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  refresh_token?: string
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  id_token?: string
  error?: string
}

export interface GoogleUser {
  id: string
  email?: string
  name?: string
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  verified_email?: boolean
}

interface FetchGoogleTokensInput {
  code: string
  codeVerifier: string
  redirectUri: string
  clientId: string
  clientSecret: string
}

export async function fetchGoogleTokens({
  code,
  codeVerifier,
  redirectUri,
  clientId,
  clientSecret,
}: FetchGoogleTokensInput): Promise<GoogleTokenResponse> {
  const tokenBody = new URLSearchParams({
    code,
    // biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case
    client_id: clientId,
    // biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case
    client_secret: clientSecret,
    // biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case
    redirect_uri: redirectUri,
    // biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case
    grant_type: 'authorization_code',
    // biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case
    code_verifier: codeVerifier,
  })
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenBody.toString(),
    signal: AbortSignal.timeout(fetchTimeoutMs),
  })
  let tokenData: GoogleTokenResponse
  try {
    tokenData = (await tokenRes.json()) as GoogleTokenResponse
  } catch {
    const err = new Error('Token exchange failed') as Error & {
      status: number
      tokenData: GoogleTokenResponse
    }
    err.status = tokenRes.status
    err.tokenData = {} as GoogleTokenResponse
    throw err
  }
  if (!tokenRes.ok) {
    const err = new Error('Token exchange failed') as Error & {
      status: number
      tokenData: GoogleTokenResponse
    }
    err.status = tokenRes.status
    err.tokenData = tokenData
    throw err
  }
  if (tokenData.error || !tokenData.access_token) {
    const err = new Error('Token exchange failed') as Error & {
      status: number
      tokenData: GoogleTokenResponse
    }
    err.status = 400
    err.tokenData = tokenData
    throw err
  }
  return tokenData
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUser> {
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    // biome-ignore lint/style/useNamingConvention: HTTP header canonical form
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(fetchTimeoutMs),
  })
  let gUser: GoogleUser
  try {
    gUser = (await userRes.json()) as GoogleUser
  } catch {
    const err = new Error('User info fetch failed') as Error & { status: number; gUser: GoogleUser }
    err.status = userRes.status
    err.gUser = {} as GoogleUser
    throw err
  }
  if (!userRes.ok) {
    const err = new Error('User info fetch failed') as Error & { status: number; gUser: GoogleUser }
    err.status = userRes.status
    err.gUser = gUser
    throw err
  }
  if (!gUser?.id) {
    const err = new Error('Invalid user response') as Error & { status: number; gUser: GoogleUser }
    err.status = 400
    err.gUser = gUser
    throw err
  }
  return gUser
}
