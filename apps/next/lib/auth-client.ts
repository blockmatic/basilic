/** Client-side helper to refresh JWT cookies after link-email or profile update */
export async function updateAuthTokens({
  token,
  refreshToken,
}: {
  token: string
  refreshToken: string
}): Promise<void> {
  await fetch('/api/auth/update-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, refreshToken }),
    credentials: 'include',
  })
}
