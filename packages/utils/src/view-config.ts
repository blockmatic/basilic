import { z } from "zod";

export const viewSurfaces = ["status", "account"] as const;

export const viewConfigSchema = z.object({
  q: z.string(),
  surface: z.enum(viewSurfaces),
  version: z.literal(1),
});

export type ViewConfig = z.infer<typeof viewConfigSchema>;
export type ViewSurface = (typeof viewSurfaces)[number];

export function parseViewConfig({
  value,
}: {
  value: unknown;
}): ViewConfig | null {
  const parsed = viewConfigSchema.safeParse(value);
  if (!parsed.success) return null;
  return parsed.data;
}

export function viewFromCommand({
  q,
  surface,
}: {
  q: string;
  surface: ViewSurface;
}): ViewConfig {
  return { q, surface, version: 1 };
}
