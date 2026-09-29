import { z } from "zod";

export const universeValues = ["all", "majors", "watchlist"] as const;
export const sortByValues = [
  "rank",
  "change24h",
  "volume",
  "marketCap",
  "price",
] as const;
export const sortDirValues = ["asc", "desc"] as const;

export const defaultSearchQuery = {
  highlight: [] as string[],
  maxChangePct: null as number | null,
  maxPrice: null as number | null,
  minChangePct: null as number | null,
  minPrice: null as number | null,
  sortBy: "rank" as const,
  sortDir: "asc" as const,
  symbols: [] as string[],
  text: null as string | null,
  topN: null as number | null,
  universe: "all" as const,
};

const searchQuerySchema = z.object({
  highlight: z.array(z.string()),
  maxChangePct: z.number().nullable(),
  maxPrice: z.number().nullable(),
  minChangePct: z.number().nullable(),
  minPrice: z.number().nullable(),
  sortBy: z.enum(sortByValues),
  sortDir: z.enum(sortDirValues),
  symbols: z.array(z.string()),
  text: z.string().nullable(),
  topN: z.number().nullable(),
  universe: z.enum(universeValues),
});

export const viewSurfaces = [
  "table",
  "screener",
  "comparison",
  "chart",
  "news",
  "dashboard",
  "coin",
  "account",
] as const;

export const chartKinds = ["line", "area", "bar", "normalized"] as const;
export const periodValues = ["24h", "7d", "30d", "90d", "1y", "6m"] as const;

export const viewConfigSchema = z.object({
  benchmark: z.string().optional(),
  chart: z.enum(chartKinds).optional(),
  columns: z.array(z.string()).optional(),
  elements: z.array(z.string()).optional(),
  period: z.enum(periodValues).optional(),
  query: searchQuerySchema,
  surface: z.enum(viewSurfaces),
  title: z.string(),
  version: z.literal(1),
});

export type ViewConfig = z.infer<typeof viewConfigSchema>;
export type ViewSurface = (typeof viewSurfaces)[number];
export type ViewPeriod = (typeof periodValues)[number];
export type ViewChart = (typeof chartKinds)[number];
export type SearchQuery = ViewConfig["query"];

export function parseViewConfig({
  value,
}: {
  value: unknown;
}): ViewConfig | null {
  const parsed = viewConfigSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export function viewFromSearchQuery({
  query,
  title,
  surface = "table",
  period,
  columns,
  elements,
  chart,
}: {
  query: SearchQuery;
  title: string;
  surface?: ViewSurface;
  period?: ViewPeriod | null;
  columns?: string[];
  elements?: string[];
  chart?: ViewChart | null;
}): ViewConfig {
  return {
    query,
    surface,
    title,
    version: 1,
    ...(period ? { period } : {}),
    ...(columns?.length ? { columns } : {}),
    ...(elements?.length ? { elements } : {}),
    ...(chart ? { chart } : {}),
  };
}
