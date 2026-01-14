import { z } from 'zod'

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  now: z.string().datetime(),
})

export type HealthResponseDTO = z.infer<typeof HealthResponseSchema>
