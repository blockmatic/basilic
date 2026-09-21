import 'dotenv/config'
import { parseBool } from '@repo/utils/logger/types'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

const isProduction = process.env.NODE_ENV === 'production'
const rejectedDevDefault = 'default-jwt-secret-min-32-chars-for-dev'

const jwtSecretSchema = isProduction
  ? z
      .string()
      .min(32)
      .refine(
        val => val !== rejectedDevDefault,
        'JWT_SECRET must not be the dev default in production',
      )
  : z.string().min(32).default(rejectedDevDefault)

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PGLITE: z.coerce.boolean().default(false),
    DATABASE_URL: z
      .string()
      .optional()
      .transform(val => {
        if (process.env.PGLITE === 'true' && !val) return 'postgresql://localhost/test'
        return val ?? ''
      })
      .refine(val => (process.env.PGLITE !== 'true' ? val !== undefined && val.length > 0 : true), {
        message: 'DATABASE_URL is required when PGLITE is not enabled',
      }),
    JWT_SECRET: jwtSecretSchema,
    JWT_ISSUER: z.string().default('api.yourapp.com'),
    JWT_AUDIENCE: z
      .string()
      .default('api.yourapp.com')
      .transform(val => val.split(',').map(aud => aud.trim())),
    ALLOWED_ORIGINS: z
      .string()
      .default('*')
      .transform(val => {
        const parts = val
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
        return parts.length > 0 ? parts : ['*']
      })
      .refine(
        val => !isProduction || (val.length > 0 && !val.includes('*')),
        'ALLOWED_ORIGINS must be a non-empty list of explicit origins in production (not *)',
      ),
    COINGECKO_DEMO_API_KEY: z.string().min(1).optional(),
    COINS_USE_FIXTURE: z
      .string()
      .optional()
      .transform(val => parseBool(val, false)),
    MARKETS_CACHE_MS: z.coerce.number().int().positive().default(300_000),
    AI_GATEWAY_API_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
