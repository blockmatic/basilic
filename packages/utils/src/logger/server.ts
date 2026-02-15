import pino from 'pino'
import type { Logger } from './types.js'
import { normalizeLevel, parseBool } from './types.js'

const isTestOrCi =
  process.env.CI === 'true' || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'
const enabled = parseBool(process.env.LOG_ENABLED, true)
const rawLevel = process.env.LOG_LEVEL ?? (isTestOrCi ? 'silent' : undefined)
const level = enabled ? normalizeLevel(rawLevel) : 'silent'

const root = pino({
  level,
  base: {
    service: process.env.LOG_SERVICE ?? 'app',
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local',
  },
  redact: {
    paths: ['req.headers.authorization', '*.password', '*.token', '*.secret'],
    censor: '[REDACTED]',
  },
})

/**
 * Wraps a Pino logger instance to match the Logger interface.
 *
 * Converts Pino's logging API to the unified Logger interface used across
 * the codebase. Handles optional data parameter correctly.
 *
 * @internal
 */
const wrap = (x: pino.Logger): Logger => ({
  debug: (data, msg) => {
    if (data !== undefined) {
      x.debug(data as object, msg)
    } else {
      x.debug(msg)
    }
  },
  info: (data, msg) => {
    if (data !== undefined) {
      x.info(data as object, msg)
    } else {
      x.info(msg)
    }
  },
  warn: (data, msg) => {
    if (data !== undefined) {
      x.warn(data as object, msg)
    } else {
      x.warn(msg)
    }
  },
  error: (data, msg) => {
    if (data !== undefined) {
      x.error(data as object, msg)
    } else {
      x.error(msg)
    }
  },
  child: bindings => wrap(x.child(bindings)),
})

/**
 * Node.js/server-side logger implementation.
 *
 * Uses Pino for structured logging with automatic PII redaction. Configure via
 * `LOG_ENABLED` and `LOG_LEVEL` environment variables. Automatically redacts
 * sensitive fields like passwords, tokens, and authorization headers.
 *
 * @example
 * ```ts
 * import { logger } from '@repo/utils/logger/server'
 *
 * logger.info({ userId: '123', action: 'login' }, 'User logged in')
 * logger.error({ err: error, requestId: 'abc' }, 'Request failed')
 *
 * const requestLogger = logger.child({ requestId: 'abc' })
 * requestLogger.debug('Processing request')
 * ```
 */
export const logger: Logger = wrap(root)
export type { Logger, LogLevel } from './types.js'
