import * as Sentry from '@sentry/nextjs'

/**
 * Initializes Sentry for server-side error tracking.
 * Follows RORO pattern (Receive an Object, Return an Object).
 */
export function initSentry({ dsn, environment }: { dsn?: string; environment?: string }) {
  if (!dsn) return { initialized: false }

  const env = environment || process.env.NODE_ENV || 'development'

  Sentry.init({
    dsn,
    environment: env,
    tracesSampleRate: env === 'production' ? 0.1 : 1.0,
    debug: env === 'development',
  })

  return { initialized: true }
}
