import { initErrorReporting } from '@repo/error/nextjs'
import { env } from './lib/env.js'

initErrorReporting({
  dsn: env.ERROR_REPORTING_DSN,
  environment: env.ERROR_REPORTING_ENVIRONMENT ?? env.NODE_ENV,
})
