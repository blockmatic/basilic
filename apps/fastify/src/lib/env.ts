import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PGLITE: z.coerce.boolean().default(false),
    DATABASE_URL: z
      .string()
      .optional()
      .transform(val => {
        // Note: Must check process.env.PGLITE here because env.PGLITE isn't available during transform phase
        if (process.env.PGLITE === 'true' && !val) {
          return 'postgresql://localhost/test'
        }
        return val ?? ''
      })
      .refine(
        val => {
          // When PGLITE is not true, DATABASE_URL must be non-empty
          if (process.env.PGLITE !== 'true') {
            return val !== undefined && val.length > 0
          }
          return true
        },
        {
          message: 'DATABASE_URL is required when PGLITE is not enabled',
        },
      ),
    REDIS_URL: z.string().min(1).optional(),
    SENTRY_DSN: z.string().min(1).optional(),
    SENTRY_ENVIRONMENT: z.string().min(1).optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(1),
    SENTRY_REPLACES_HEADERS: z.coerce.boolean().default(false),
    SENTRY_REPLACES_PROD_ENV: z.coerce.boolean().default(false),
    // Security configuration
    ALLOWED_ORIGINS: z
      .string()
      .default('*')
      .transform(val => (val === '*' ? '*' : val.split(',').map(origin => origin.trim()))),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_TIME_WINDOW: z.coerce.number().int().positive().default(60000),
    TRUST_PROXY: z.coerce.boolean().default(true),
    SECURITY_HEADERS_ENABLED: z.coerce.boolean().default(true),
    BODY_LIMIT: z.coerce.number().int().positive().default(1048576), // 1MB default
    REQUEST_TIMEOUT: z.coerce.number().int().positive().default(30000), // 30s default
    // Logging configuration
    LOG_ENABLED: z.coerce.boolean().optional(),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
    LOG_SERVICE: z.string().optional(),
    // AI configuration
    OPENAI_API_KEY: z.string().min(1),
    ENCRYPTION_KEY: z
      .string()
      .length(64)
      .regex(/^[0-9a-fA-F]+$/, 'Must be a 32-byte hex string'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
