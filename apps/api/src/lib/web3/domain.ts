export function isAllowedWeb3Domain({
  domain,
  allowedOrigins,
}: {
  domain: string
  allowedOrigins: readonly string[]
}): boolean {
  if (allowedOrigins.includes('*')) return true

  const normalizedDomain = domain.trim().toLowerCase()
  if (!normalizedDomain) return false

  return allowedOrigins.some(origin => {
    try {
      const url = new URL(origin)
      const hostname = url.hostname.toLowerCase()
      const host = url.host.toLowerCase()
      return normalizedDomain === hostname || normalizedDomain === host
    } catch {
      return false
    }
  })
}
