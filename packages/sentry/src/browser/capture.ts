import * as Sentry from '@sentry/browser'
import { createCaptureError } from '../core/capture-impl.js'

/**
 * Captures errors to Sentry for browser environments.
 *
 * Use this export for browser-only frameworks like TanStack Start, Vue, Svelte, etc.
 * For Next.js applications, use `@repo/sentry/nextjs` instead (works for both client and server).
 *
 * @example
 * ```ts
 * import { captureError } from '@repo/sentry/browser'
 *
 * try {
 *   // Some operation
 * } catch (error) {
 *   captureError({
 *     code: 'OPERATION_ERROR',
 *     error,
 *     label: 'User Action',
 *     tags: { app: 'web' },
 *   })
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
