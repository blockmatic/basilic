export async function updateAuthTokens({
  token,
  refreshToken,
}: {
  token: string
  refreshToken: string
}) {
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
    const bodyText = await response.text()
    const errorDetail =
      (() => {
        try {
          return (JSON.parse(bodyText) as { message?: string })?.message ?? bodyText
        } catch {
          return bodyText
        }
      })() || `HTTP ${response.status}`
    throw new Error(`Token refresh failed (${response.status}): ${errorDetail}`)
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/get-session', { credentials: 'include' })
    if (!response.ok) return null
    const data = (await response.json()) as unknown
    if (data === null || typeof data !== 'object' || !('token' in data)) return null
    const token = (data as { token?: unknown }).token
    return typeof token === 'string' ? token : null
  } catch {
    return null
  }
}
