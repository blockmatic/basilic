import { z } from 'zod/v4'

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  now: z.string().datetime(),
})

export type HealthResponseDTO = z.infer<typeof HealthResponseSchema>
