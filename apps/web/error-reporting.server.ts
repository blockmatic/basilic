import { initErrorReporting } from '@repo/error/nextjs/server'
import { env } from './lib/env.js'

initErrorReporting({
  dsn: env.SENTRY_DSN,
  environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
})
