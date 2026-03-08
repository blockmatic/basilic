import { logger } from '@repo/utils/logger/client'
import * as Sentry from '@sentry/nextjs'
import { createCaptureError } from '../core/capture-impl.js'

/**
 * Captures errors to the reporting backend for Next.js applications.
 *
 * Use this export for Next.js applications. Works for both client-side and server-side code.
 * For pure Node.js/Fastify apps, use `@repo/error/node` instead.
 * For browser-only frameworks, use `@repo/error/browser` instead.
 *
 * @example
 * ```ts
 * import { captureError } from '@repo/error/nextjs'
 *
 * // In API route
 * export async function GET(request: Request) {
 *   try {
 *     // Some operation
 *   } catch (error) {
 *     captureError({
 *       code: 'API_ERROR',
 *       error,
 *       label: 'API Route',
 *       tags: { route: '/api/data' },
 *     })
 *   }
 * }
 *
 * // In Server Component
 * async function ServerComponent() {
 *   try {
 *     // Some operation
 *   } catch (error) {
 *     captureError({
 *       code: 'SERVER_COMPONENT_ERROR',
 *       error,
 *       label: 'Server Component',
 *     })
 *   }
 * }
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
