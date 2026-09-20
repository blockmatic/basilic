import { Type } from '@sinclair/typebox'

const catalogProblemFields = {
  type: Type.Optional(Type.String()),
  title: Type.Optional(Type.String()),
  status: Type.Optional(Type.Integer()),
  detail: Type.Optional(Type.String()),
}

export const ErrorResponseSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  ...catalogProblemFields,
})

export const RateLimitResponseSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  retryAfter: Type.Integer(),
  ...catalogProblemFields,
})
