export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface Logger {
  debug: (data?: unknown, msg?: string) => void
  info: (data?: unknown, msg?: string) => void
  warn: (data?: unknown, msg?: string) => void
  error: (data?: unknown, msg?: string) => void
  child: (bindings: Record<string, unknown>) => Logger
}

export const parseBool = (v: string | undefined, fallback: boolean): boolean => {
  if (v == null) return fallback
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
}

export const normalizeLevel = (v: string | undefined): LogLevel => {
  const x = (v ?? '').toLowerCase()
  if (x === 'debug' || x === 'info' || x === 'warn' || x === 'error' || x === 'silent') return x
  return 'info'
}
