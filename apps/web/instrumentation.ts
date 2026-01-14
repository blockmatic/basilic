export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initSentry } = await import('./sentry.server.config')
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT

    if (dsn) {
      initSentry({ dsn, environment })
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization if needed
  }
}
