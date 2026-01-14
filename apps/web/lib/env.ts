import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Gets validated environment variables.
 * Returns validated env vars or throws if required vars are missing.
 * Note: In Next.js, NEXT_PUBLIC_* variables are replaced at build time.
 */
export function getEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${result.error.message}`)
  }

  return result.data
}

/**
 * Validated environment configuration object.
 * Validated at module load - fails fast if config is invalid in production.
 */
export const zEnv = getEnv()
