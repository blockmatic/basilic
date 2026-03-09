import { Type } from '@sinclair/typebox'

export const ErrorResponseSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
})

export const RateLimitResponseSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  retryAfter: Type.Integer(),
})
