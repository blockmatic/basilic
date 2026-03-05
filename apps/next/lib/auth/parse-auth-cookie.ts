export function parseAuthCookie(value: string | undefined): {
  token: string | null
  refreshToken: string | null
} {
  if (!value) return { token: null, refreshToken: null }
  try {
    const parsed = JSON.parse(value) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as { token?: unknown }).token === 'string' &&
      typeof (parsed as { refreshToken?: unknown }).refreshToken === 'string'
    )
      return {
        token: (parsed as { token: string }).token,
        refreshToken: (parsed as { refreshToken: string }).refreshToken,
      }
  } catch {
    // ignore
  }
  return { token: null, refreshToken: null }
}
