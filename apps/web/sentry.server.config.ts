import * as Sentry from '@sentry/nextjs'
import { env } from './lib/env'

/**
 * Initializes Sentry for server-side error tracking.
 * Follows RORO pattern (Receive an Object, Return an Object).
 */
export function initSentry({ dsn, environment }: { dsn?: string; environment?: string }) {
  if (!dsn) return { initialized: false }

  const sentryEnv = environment ?? env.NODE_ENV

  Sentry.init({
    dsn,
    environment: sentryEnv,
    tracesSampleRate: sentryEnv === 'production' ? 0.1 : 1.0,
    debug: sentryEnv === 'development',
  })

  return { initialized: true }
}
