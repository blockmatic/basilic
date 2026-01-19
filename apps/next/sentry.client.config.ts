import * as Sentry from '@sentry/nextjs'
import { env } from './lib/env'

/**
 * Initializes Sentry for client-side error tracking.
 * Follows RORO pattern (Receive an Object, Return an Object).
 */
export function initSentry({ dsn, environment }: { dsn?: string; environment?: string }) {
  if (!dsn) return { initialized: false }

  const sentryEnv = environment ?? env.NEXT_PUBLIC_SENTRY_ENVIRONMENT

  Sentry.init({
    dsn,
    environment: sentryEnv,
    tracesSampleRate: sentryEnv === 'production' ? 0.1 : 1.0,
    debug: sentryEnv === 'development',
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: sentryEnv === 'production' ? 0.1 : 1.0,
    integrations: [Sentry.replayIntegration({ maskAllText: false })],
  })

  return { initialized: true }
}
