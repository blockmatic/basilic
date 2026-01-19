import { captureError, mapHttpStatusToErrorCode } from '@repo/error/node'
import type { FastifyError, FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

/**
 * Exception map for irregular plural-to-singular conversions
 */
const PLURAL_EXCEPTIONS: Record<string, string> = {
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
  const singular = PLURAL_EXCEPTIONS[resource] ?? resource.replace(/s$/, '')
  return `${singular}-service`
}

/**
 * Fastify error handler plugin
 * Registers global error handler that captures errors to Sentry and returns safe catalog errors
 */
/**
 * Redacts sensitive data from headers
 */
function redactHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...headers }
  const sensitiveKeys = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']
  for (const key of sensitiveKeys) {
    const lowerKey = Object.keys(redacted).find(k => k.toLowerCase() === key)
    if (lowerKey) {
      redacted[lowerKey] = '[REDACTED]'
    }
  }
  return redacted
}

/**
 * Redacts sensitive data from request body
 */
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
    'authorization',
  ]

  for (const field of sensitiveFields) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]'
    }
  }

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

    // Redact sensitive data before sending to Sentry
    const sanitizedHeaders = redactHeaders(request.headers as Record<string, unknown>)
    const sanitizedBody = redactBody(request.body)

    // captureError handles logging via Fastify's native logger (request.log)
    // Captures REAL error to Sentry with built-in PII scrubbing
    // Uses Fastify's native Pino logger with request context (requestId via requestIdLogLabel: 'reqId')
    const catalogError = captureError({
      code: mapHttpStatusToErrorCode(statusCode),
      error, // ← Full stack trace → Sentry
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

    // Return SAFE catalog error with type-safe status code
    reply.status(statusCode).send({
      code: catalogError.code,
      message: catalogError.message,
    })
  })
})
