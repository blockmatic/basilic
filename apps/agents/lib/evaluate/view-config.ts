import {
  defaultSearchQuery,
  parseViewConfig,
  type ViewConfig,
  type ViewSurface,
  viewConfigSchema,
  viewFromSearchQuery,
} from '@repo/utils/view-config'
import { z } from 'zod'

export {
  defaultSearchQuery,
  parseViewConfig,
  type ViewConfig,
  type ViewSurface,
  viewConfigSchema,
  viewFromSearchQuery,
}

export const setViewInputSchema = z.object({
  viewConfig: viewConfigSchema.omit({ elements: true }),
  honesty: z.string().optional(),
})

export type SetViewInput = z.infer<typeof setViewInputSchema>
