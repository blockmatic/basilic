import * as Sentry from '@sentry/browser'
import { createCaptureError } from '../core/capture-impl.js'

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
