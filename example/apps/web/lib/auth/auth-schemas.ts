import { z } from "zod";

export const authCookieSchema = z.object({
  refreshToken: z.string(),
  token: z.string(),
});

export type AuthCookie = z.infer<typeof authCookieSchema>;

export const jwtPayloadSchema = z
  .object({
    exp: z.number().optional(),
    iat: z.number().optional(),
    sid: z.string().optional(),
    sub: z.string().optional(),
    typ: z.string().optional(),
  })
  .passthrough();

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
