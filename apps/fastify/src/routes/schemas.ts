import { Type } from '@sinclair/typebox'

export const ErrorResponseSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
})
