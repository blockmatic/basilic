import { Type } from "@sinclair/typebox";

const catalogProblemFields = {
  detail: Type.Optional(Type.String()),
  status: Type.Optional(Type.Integer()),
  title: Type.Optional(Type.String()),
  type: Type.Optional(Type.String()),
};

export const ErrorResponseSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  ...catalogProblemFields,
});

export const RateLimitResponseSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  retryAfter: Type.Integer(),
  ...catalogProblemFields,
});
