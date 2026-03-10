import { initErrorReporting } from '@repo/error/nextjs'
import { env } from './lib/env.js'

initErrorReporting({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? env.NEXT_PUBLIC_NODE_ENV,
})
