import type { IncomingMessage } from 'node:http'
import type { LoggerOptions } from 'pino'
import { pathOnlyUrl, pinoRedactPaths } from './redact.js'
import { normalizeLevel, parseBool } from './types.js'

const prettyTransport = {
  target: 'pino-pretty',
  options: {
    translateTime: 'HH:MM:ss Z',
    ignore: 'pid,hostname',
  },
}

export function createPinoOptions({
  pretty = false,
  level,
  service,
  enabled,
}: {
  pretty?: boolean
  level?: string
  service?: string
  enabled?: boolean
} = {}): LoggerOptions {
  const isTestOrCi =
    process.env.CI === 'true' || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'
  const resolvedEnabled = enabled ?? parseBool(process.env.LOG_ENABLED, true)
  const rawLevel = level ?? process.env.LOG_LEVEL ?? (isTestOrCi ? 'silent' : undefined)
  const resolvedLevel = resolvedEnabled ? normalizeLevel(rawLevel) : 'silent'

  return {
    level: resolvedLevel,
    base: {
      service: service ?? process.env.LOG_SERVICE ?? 'app',
      env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local',
    },
    redact: {
      paths: [...pinoRedactPaths],
      censor: '[REDACTED]',
    },
    serializers: {
      req: (req: IncomingMessage) => ({
        method: req.method,
        url: typeof req.url === 'string' ? pathOnlyUrl(req.url) : undefined,
      }),
    },
    ...(pretty ? { transport: prettyTransport } : {}),
  }
}
