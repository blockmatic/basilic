/** Client-side helper to refresh JWT cookies after link-email or profile update */
export async function updateAuthTokens({
  token,
  refreshToken,
}: {
  token: string
  refreshToken: string
}): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/auth/update-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, refreshToken }),
      credentials: 'include',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Token refresh request failed: ${msg}`)
  }

  if (!response.ok) {
    let bodyText = ''
    try {
      bodyText = await response.text()
    } catch {
      bodyText = '(unable to read response body)'
    }
    let errorDetail: string
    try {
      const parsed = JSON.parse(bodyText) as { message?: string }
      errorDetail = parsed?.message ?? (bodyText || `HTTP ${response.status}`)
    } catch {
      errorDetail = bodyText || `HTTP ${response.status}`
    }
    throw new Error(`Token refresh failed (${response.status}): ${errorDetail}`)
  }
}
