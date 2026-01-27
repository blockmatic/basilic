import * as Sentry from '@sentry/nextjs'
import { createCaptureError } from '../core/capture-impl.js'

/**
 * Captures errors to Sentry for Next.js applications.
 *
 * Use this export for Next.js applications. Works for both client-side and server-side code.
 * For pure Node.js/Fastify apps, use `@repo/sentry/node` instead.
 * For browser-only frameworks, use `@repo/sentry/browser` instead.
 *
 * @example
 * ```ts
 * import { captureError } from '@repo/sentry/nextjs'
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
export const captureError = createCaptureError({
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
})
