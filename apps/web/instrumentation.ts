import { initSentry } from '@repo/error/nextjs'
import { env } from './lib/env'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry
    const dsn = env.NEXT_PUBLIC_SENTRY_DSN
    const environment = env.NEXT_PUBLIC_SENTRY_ENVIRONMENT

    if (dsn) {
      initSentry({ dsn, environment })
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization if needed
  }
}
