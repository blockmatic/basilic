import { logger } from '@repo/utils/logger/server'
import * as Sentry from '@sentry/node'
import { createCaptureError } from '../core/capture-impl.js'

/**
 * Captures errors to Sentry for Node.js/Fastify environments.
 *
 * Use this export for Node.js applications and Fastify servers.
 * For Next.js applications, use `@repo/sentry/nextjs` instead.
 *
 * @example
 * ```ts
 * import { captureError } from '@repo/sentry/node'
 *
 * fastify.setErrorHandler((error, request, reply) => {
 *   captureError({
 *     code: 'SERVER_ERROR',
 *     error,
 *     logger: request.log, // Use Fastify's logger for request context
 *     label: `${request.method} ${request.url}`,
 *     tags: { app: 'api' },
 *   })
 *   // Handle error response...
 * })
 * ```
 */
export const captureError = createCaptureError(
  {
    getClient: () => {
      const client = Sentry.getClient()
      return client ? client : null
    },
    captureException: (
      exception: Error,
      hint?: {
        tags?: Record<string, string>
        level?: 'error' | 'warning' | 'info'
        contexts?: Record<string, Record<string, unknown>>
      },
    ) => {
      Sentry.captureException(exception, hint)
    },
  },
  logger,
)
