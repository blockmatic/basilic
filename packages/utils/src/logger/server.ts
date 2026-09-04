import pino from 'pino'
import { normalizeLogArgs } from './normalize.js'
import { createPinoOptions } from './pino-options.js'
import type { Logger } from './types.js'

const root = pino(createPinoOptions())

const wrap = (x: pino.Logger): Logger => ({
  debug: (data, msg) => {
    const { obj, msg: message } = normalizeLogArgs(data, msg)
    if (obj) x.debug(obj, message)
    else x.debug(message)
  },
  info: (data, msg) => {
    const { obj, msg: message } = normalizeLogArgs(data, msg)
    if (obj) x.info(obj, message)
    else x.info(message)
  },
  warn: (data, msg) => {
    const { obj, msg: message } = normalizeLogArgs(data, msg)
    if (obj) x.warn(obj, message)
    else x.warn(message)
  },
  error: (data, msg) => {
    const { obj, msg: message } = normalizeLogArgs(data, msg)
    if (obj) x.error(obj, message)
    else x.error(message)
  },
  child: bindings => wrap(x.child(bindings)),
})

/**
 * Node.js/server-side logger. Uses Pino with shared `createPinoOptions`.
 *
 * @example
 * ```ts
 * import { logger } from '@repo/utils/logger/server'
 *
 * logger.info({ userId: '123', action: 'login' }, 'User logged in')
 * logger.error({ err }, 'Request failed')
 *
 * const requestLogger = logger.child({ reqId: 'abc' })
 * requestLogger.debug('Processing request')
 * ```
 */
export const logger: Logger = wrap(root)
export { normalizeLogArgs, toErrField } from './normalize.js'
export { createPinoOptions } from './pino-options.js'
export {
  isValidRequestId,
  pathOnlyUrl,
  pinoRedactPaths,
  sanitizeLogData,
  sensitiveKeys,
} from './redact.js'
export type { Logger, LogLevel } from './types.js'
