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
    const routePath = (request as { routerPath?: string }).routerPath ?? request.url.split('?')[0]
    const module = extractModuleFromRoute(routePath) ?? 'api-route'

    // Redact sensitive data before sending to Sentry
    const sanitizedHeaders = redactHeaders(request.headers as Record<string, unknown>)
    const sanitizedBody = redactBody(request.body)

    // captureError handles logging via @repo/utils/logger
    // Captures REAL error to Sentry with built-in PII scrubbing
    const catalogError = captureError({
      code: mapHttpStatusToErrorCode(error.statusCode),
      error, // ← Full stack trace → Sentry
      label: `${request.method} ${request.url}`,
      data: {
        requestId: request.id,
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

    // Return SAFE catalog error
    reply.status(error.statusCode ?? 500).send({
      code: catalogError.code,
      message: catalogError.message,
    })
  })
})
