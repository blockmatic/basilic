import pino from 'pino'
import type { Logger } from './types.js'
import { normalizeLevel, parseBool } from './types.js'

const enabled = parseBool(process.env.LOG_ENABLED, true)
const level = enabled ? normalizeLevel(process.env.LOG_LEVEL) : 'silent'

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

export const logger: Logger = wrap(root)
