import { initErrorReporting } from '@repo/error/nextjs'
import { env } from './lib/env.js'

initErrorReporting({
  dsn: env.NEXT_PUBLIC_ERROR_REPORTING_DSN,
  environment: env.NEXT_PUBLIC_NODE_ENV,
})
