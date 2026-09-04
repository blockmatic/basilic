import { captureError } from '@repo/error/node'
import { pathOnlyUrl } from '@repo/utils/logger/types'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { clientErrors, serverErrors, webErrors } from './index.js'

type ServerErrorCode = keyof typeof serverErrors
type ClientErrorCode = keyof typeof clientErrors
type WebErrorCode = keyof typeof webErrors
export type ErrorCode = ServerErrorCode | ClientErrorCode | WebErrorCode

export interface CatalogError {
  code: string
  message: string
}

const allErrors = {
  ...serverErrors,
  ...clientErrors,
  ...webErrors,
} as const

/**
 * Send a catalog error as an HTTP response
 */
export function sendCatalogError({
  reply,
  status,
  code,
}: {
  reply: FastifyReply
  status: number
  code: ErrorCode
}): FastifyReply {
  const err = getError(code) ??
    getError('UNEXPECTED_ERROR') ?? { code: 'UNEXPECTED_ERROR', message: 'Unexpected error' }
  return reply.code(status).send(err)
}

export function sendServerCatalogError({
  request,
  reply,
  code,
  error,
}: {
  request: FastifyRequest
  reply: FastifyReply
  code: ErrorCode
  error?: unknown
}): FastifyReply {
  captureError({
    error: error instanceof Error ? error : new Error(code),
    logger: request.log,
    label: code,
    code,
    data: { method: request.method, url: pathOnlyUrl(request.url) },
    tags: { app: 'api' },
  })
  return sendCatalogError({ reply, status: 500, code })
}

/**
 * Maps HTTP status codes to error catalog codes
 */
export function mapHttpStatusToErrorCode(statusCode?: number): ErrorCode {
  if (!statusCode || typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599)
    return 'UNEXPECTED_ERROR'

  if (statusCode >= 200 && statusCode < 300) return 'UNEXPECTED_ERROR'

  if (statusCode >= 300 && statusCode < 400) return 'UNEXPECTED_ERROR'

  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 422:
      return 'INVALID_INPUT'
    case 429:
      return 'RATE_LIMIT_EXCEEDED'
    case 500:
      return 'SERVER_ERROR'
    case 502:
      return 'BAD_GATEWAY'
    case 503:
      return 'SERVICE_UNAVAILABLE'
    case 504:
      return 'GATEWAY_TIMEOUT'
    default:
      if (statusCode >= 400 && statusCode < 500) return 'BAD_REQUEST'

      return 'SERVER_ERROR'
  }
}

/**
 * Retrieves an error from the catalog by code
 */
export function getError(code: string): CatalogError | undefined {
  const error = allErrors[code as ErrorCode]
  return error ? { code: error.code, message: error.message } : undefined
}
