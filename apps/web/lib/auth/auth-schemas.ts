import { z } from 'zod'

export const authCookieSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
})

export type AuthCookie = z.infer<typeof authCookieSchema>

export const jwtPayloadSchema = z
  .object({
    typ: z.string().optional(),
    sub: z.string().optional(),
    sid: z.string().optional(),
    exp: z.number().optional(),
    iat: z.number().optional(),
  })
  .passthrough()

export type JwtPayload = z.infer<typeof jwtPayloadSchema>
