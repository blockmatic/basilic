function getRequestHost(request: Request) {
  const forwarded = request.headers.get('X-Forwarded-Host')
  if (forwarded) return forwarded.split(',')[0]?.trim()
  return request.headers.get('Host') ?? undefined
}

export function isSameOriginRequest(request: Request) {
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') return false

  const origin = request.headers.get('Origin')
  if (!origin) return false

  const host = getRequestHost(request)
  if (!host) return false

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
