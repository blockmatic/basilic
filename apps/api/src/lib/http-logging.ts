import { randomUUID } from 'node:crypto'
import { createPinoOptions } from '@repo/utils/logger/pino-options'
import { isValidRequestId } from '@repo/utils/logger/types'
import type { FastifyRequest } from 'fastify'
import { LogController } from 'fastify'
import { env, logLevelProvided } from './env.js'

export const requestIdHeader = 'x-request-id'

export function genReqId(req: { headers: Record<string, unknown> }): string {
  const raw = req.headers[requestIdHeader]
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value === 'string' && isValidRequestId(value)) return value
  return randomUUID()
}

function skipHealthAccessLog(request: FastifyRequest): boolean {
  const path = request.url?.split('?')[0] ?? ''
  return request.method === 'GET' && path === '/health'
}

export function createApiLoggerOptions({
  pretty = false,
  level,
}: {
  pretty?: boolean
  level?: string
} = {}) {
  const testOrCi = env.NODE_ENV === 'test' || env.CI
  const resolvedLevel = level ?? (testOrCi && !logLevelProvided ? 'silent' : env.LOG_LEVEL)

  return {
    logger: createPinoOptions({
      pretty,
      level: resolvedLevel,
      service: env.LOG_SERVICE,
      enabled: env.LOG_ENABLED,
    }),
    genReqId,
    logController: new LogController({
      requestIdLogLabel: 'reqId',
      disableRequestLogging: skipHealthAccessLog,
    }),
  }
}
