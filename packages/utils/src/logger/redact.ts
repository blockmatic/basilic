const redacted = '[REDACTED]'

export const sensitiveKeys = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'apiKey',
  'accessToken',
  'refreshToken',
  'idToken',
  'email',
  'prompt',
  'messages',
] as const

const sensitiveKeySet = new Set(sensitiveKeys.map(key => key.toLowerCase()))

export const pinoRedactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.headers["x-auth-token"]',
  '*.password',
  '*.token',
  '*.secret',
  '*.apiKey',
  '*.accessToken',
  '*.refreshToken',
  '*.idToken',
  '*.authorization',
  '*.cookie',
  '*.email',
  '*.prompt',
  '*.messages',
]

export const requestIdPattern = /^[A-Za-z0-9._-]{1,128}$/

export function isValidRequestId(value: string): boolean {
  return requestIdPattern.test(value)
}

export function pathOnlyUrl(url: string): string {
  const cut = (value: string) => {
    const query = value.indexOf('?')
    const hash = value.indexOf('#')
    const end = Math.min(query === -1 ? value.length : query, hash === -1 ? value.length : hash)
    return value.slice(0, end) || '/'
  }

  if (url.startsWith('/')) return cut(url)

  try {
    return new URL(url).pathname || '/'
  } catch {
    return cut(url)
  }
}

export function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data))
    out[key] = sensitiveKeySet.has(key.toLowerCase()) ? redacted : value
  return out
}
