import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod/v4'

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().min(1).optional(),
    REDIS_URL: z.string().min(1).optional(),
    SENTRY_DSN: z.string().min(1).optional(),
    SENTRY_ENVIRONMENT: z.string().min(1).optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(1),
    SENTRY_REPLACES_HEADERS: z.coerce.boolean().default(false),
    SENTRY_REPLACES_PROD_ENV: z.coerce.boolean().default(false),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
