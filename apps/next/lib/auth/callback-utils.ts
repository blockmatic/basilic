import { authCookieSchema } from './auth-schemas'

export function extractTokens(response: unknown): { token: string; refreshToken: string } | null {
  const parsed = authCookieSchema.safeParse(response)
  return parsed.success ? parsed.data : null
}
