import { captureError } from '@repo/error/node'
import type { FastifyError, FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { getError, mapHttpStatusToErrorCode } from '../lib/catalogs/mapper.js'

/**
 * Exception map for irregular plural-to-singular conversions
 */
const pluralExceptions: Record<string, string> = {
  status: 'status',
  class: 'class',
  addresses: 'address',
  classes: 'class',
  statuses: 'status',
}

/**
 * Extracts module name from route path
 * Examples: /users/123 → 'user-service', /payments → 'payment-service'
 */
function extractModuleFromRoute(routePath: string): string | null {
  const match = routePath.match(/^\/([^/]+)/)
  if (!match) return null

  const resource = match[1]
  // Check exception map first, then fall back to regex removal
  const singular = pluralExceptions[resource] ?? resource.replace(/s$/, '')
  return `${singular}-service`
}

/** Redacts sensitive data from headers */
function redactHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...headers }
  const sensitiveKeys = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']
  for (const key of sensitiveKeys) {
    const lowerKey = Object.keys(redacted).find(k => k.toLowerCase() === key)
    if (lowerKey) redacted[lowerKey] = '[REDACTED]'
  }
  return redacted
}

/** Redacts sensitive data from request body */
function redactBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body

  const redacted = { ...(body as Record<string, unknown>) }
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'accessToken',
    'refreshToken',
    'idToken',
    'authorization',
  ]

  for (const field of sensitiveFields) if (field in redacted) redacted[field] = '[REDACTED]'

  return redacted
}

export default fp<Record<string, never>>(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    // Type-safe route path extraction
    const routePath: string =
      'routerPath' in request && typeof request.routerPath === 'string'
        ? request.routerPath
        : (request.url.split('?')[0] ?? '/')

    const module = extractModuleFromRoute(routePath) ?? 'api-route'

    // Type-safe status code handling
    const statusCode: number =
      typeof error.statusCode === 'number' && error.statusCode >= 100 && error.statusCode < 600
        ? error.statusCode
        : 500

    // Redact sensitive data before sending to error reporting
    const sanitizedHeaders = redactHeaders(request.headers as Record<string, unknown>)
    const sanitizedBody = redactBody(request.body)

    // Map status code to error code
    const errorCode = mapHttpStatusToErrorCode(statusCode)

    // Report via @repo/error/node (non-blocking)
    captureError({
      code: errorCode,
      error, // ← Full stack trace → reporting backend
      logger: request.log, // ← Use Fastify's native logger
      label: `${request.method} ${request.url}`,
      data: {
        method: request.method,
        url: request.url,
        headers: sanitizedHeaders,
        body: sanitizedBody, // Redacted sensitive data
      },
      tags: {
        app: 'api',
        module,
        route: routePath,
        method: request.method,
      },
    })

    // Get catalog error from app's own catalog
    const catalogError = getError(errorCode) ??
      getError('UNEXPECTED_ERROR') ?? {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred',
      }

    reply.status(statusCode).send({
      code: catalogError.code,
      message: catalogError.message,
    })
  })
})
