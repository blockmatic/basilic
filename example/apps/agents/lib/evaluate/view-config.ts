import {
  defaultSearchQuery,
  parseViewConfig,
  viewConfigSchema,
  viewFromSearchQuery,
} from "@repo/utils/view-config";
import type { ViewConfig, ViewSurface } from "@repo/utils/view-config";
import { z } from "zod";

export {
  defaultSearchQuery,
  parseViewConfig,
  type ViewConfig,
  type ViewSurface,
  viewConfigSchema,
  viewFromSearchQuery,
};

export const setViewInputSchema = z.object({
  honesty: z.string().optional(),
  viewConfig: viewConfigSchema.omit({ elements: true }),
});

export type SetViewInput = z.infer<typeof setViewInputSchema>;
