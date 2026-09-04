import { normalizeLogArgs } from './normalize.js'
import type { Logger, LogLevel } from './types.js'
import { normalizeLevel, parseBool } from './types.js'

const rank: Record<Exclude<LogLevel, 'silent'>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function defaultClientEnv(): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = {}
  env.NEXT_PUBLIC_LOG_ENABLED = process.env.NEXT_PUBLIC_LOG_ENABLED
  env.NEXT_PUBLIC_LOG_LEVEL = process.env.NEXT_PUBLIC_LOG_LEVEL
  env.NODE_ENV = process.env.NODE_ENV
  env.CI = process.env.CI
  env.VITEST = process.env.VITEST
  return env
}

export function createClientLogger(
  env: Record<string, string | undefined> = defaultClientEnv(),
): Logger {
  const isTestOrCi = env.CI === 'true' || env.NODE_ENV === 'test' || env.VITEST === 'true'
  const enabled = parseBool(env.NEXT_PUBLIC_LOG_ENABLED, env.NODE_ENV !== 'production')
  const rawLevel = env.NEXT_PUBLIC_LOG_LEVEL
  const defaultLevel = isTestOrCi ? 'silent' : enabled ? 'info' : 'silent'
  const level: LogLevel = normalizeLevel(rawLevel ?? defaultLevel)
  const explicitSilent = (rawLevel ?? '').toLowerCase() === 'silent'

  const should = (kind: Exclude<LogLevel, 'silent'>): boolean =>
    level !== 'silent' && rank[kind] >= rank[level as Exclude<LogLevel, 'silent'>]

  const emit = (
    bindings: Record<string, unknown>,
    kind: Exclude<LogLevel, 'silent'>,
    data?: unknown,
    msg?: string,
  ): void => {
    const errorAlways = kind === 'error' && !isTestOrCi && !explicitSilent
    if (!errorAlways) {
      if (!enabled) return
      if (!should(kind)) return
    }

    const { obj, msg: message } = normalizeLogArgs(data, msg)
    const merged = Object.keys(bindings).length > 0 || obj ? { ...bindings, ...obj } : undefined
    // biome-ignore lint/suspicious/noConsole: logger is the only allowed console entrypoint
    const consoleMethod = console[kind] as ((...args: unknown[]) => void) | undefined
    if (merged) consoleMethod?.(message ?? '', merged)
    else consoleMethod?.(message ?? '')
  }

  const makeChild = (bindings: Record<string, unknown>): Logger => ({
    debug: (d, m) => emit(bindings, 'debug', d, m),
    info: (d, m) => emit(bindings, 'info', d, m),
    warn: (d, m) => emit(bindings, 'warn', d, m),
    error: (d, m) => emit(bindings, 'error', d, m),
    child: b => makeChild({ ...bindings, ...b }),
  })

  return makeChild({})
}

/**
 * Browser/client-side logger. Console-backed. Production debug/info/warn are off
 * unless `NEXT_PUBLIC_LOG_*` enables them. `error` still emits unless the level
 * is explicitly `silent` or the process is test/CI.
 *
 * @example
 * ```ts
 * import { logger } from '@repo/utils/logger/client'
 *
 * logger.info({ userId: '123' }, 'User logged in')
 * logger.error({ err }, 'Request failed')
 *
 * const requestLogger = logger.child({ reqId: 'abc' })
 * requestLogger.debug('Processing request')
 * ```
 */
export const logger: Logger = createClientLogger()
export { normalizeLogArgs, toErrField } from './normalize.js'
export {
  isValidRequestId,
  pathOnlyUrl,
  sanitizeLogData,
  sensitiveKeys,
} from './redact.js'
export type { Logger, LogLevel } from './types.js'
