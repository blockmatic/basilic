import type { Logger, LogLevel } from './types.js'
import { normalizeLevel, parseBool } from './types.js'

// Off by default in production browser builds
const enabledDefault = process.env.NODE_ENV !== 'production'
const enabled = parseBool(process.env.NEXT_PUBLIC_LOG_ENABLED, enabledDefault)

const level: LogLevel = enabled ? normalizeLevel(process.env.NEXT_PUBLIC_LOG_LEVEL) : 'silent'

const rank: Record<Exclude<LogLevel, 'silent'>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const should = (kind: Exclude<LogLevel, 'silent'>): boolean =>
  level !== 'silent' && rank[kind] >= rank[level as Exclude<LogLevel, 'silent'>]

const emit = (kind: Exclude<LogLevel, 'silent'>, data?: unknown, msg?: string): void => {
  if (!enabled) return
  if (!should(kind)) return

  // console is allowed ONLY here
  // biome-ignore lint/suspicious/noConsole: logger is the only allowed console entrypoint
  const consoleMethod = console[kind] as ((...args: unknown[]) => void) | undefined
  consoleMethod?.(msg ?? '', data ?? '')
}

const makeChild = (bindings: Record<string, unknown>): Logger => {
  const merge = (data?: unknown) =>
    data && typeof data === 'object' && !Array.isArray(data)
      ? { ...bindings, ...(data as Record<string, unknown>) }
      : { ...bindings, data }

  return {
    debug: (d, m) => emit('debug', merge(d), m),
    info: (d, m) => emit('info', merge(d), m),
    warn: (d, m) => emit('warn', merge(d), m),
    error: (d, m) => emit('error', merge(d), m),
    child: b => makeChild({ ...bindings, ...b }),
  }
}

export const logger: Logger = makeChild({})
