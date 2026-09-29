import { z } from 'zod'

export const universeValues = ['all', 'majors', 'watchlist'] as const
export const sortByValues = ['rank', 'change24h', 'volume', 'marketCap', 'price'] as const
export const sortDirValues = ['asc', 'desc'] as const

export const defaultSearchQuery = {
  universe: 'all' as const,
  sortBy: 'rank' as const,
  sortDir: 'asc' as const,
  symbols: [] as string[],
  highlight: [] as string[],
  text: null as string | null,
  topN: null as number | null,
  minChangePct: null as number | null,
  maxChangePct: null as number | null,
  minPrice: null as number | null,
  maxPrice: null as number | null,
}

const searchQuerySchema = z.object({
  universe: z.enum(universeValues),
  sortBy: z.enum(sortByValues),
  sortDir: z.enum(sortDirValues),
  symbols: z.array(z.string()),
  highlight: z.array(z.string()),
  text: z.string().nullable(),
  topN: z.number().nullable(),
  minChangePct: z.number().nullable(),
  maxChangePct: z.number().nullable(),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
})

export const viewSurfaces = [
  'table',
  'screener',
  'comparison',
  'chart',
  'news',
  'dashboard',
  'coin',
  'account',
] as const

export const periodValues = ['24h', '7d', '30d', '90d', '1y', '6m'] as const

export const viewConfigSchema = z.object({
  version: z.literal(1),
  surface: z.enum(viewSurfaces),
  title: z.string(),
  query: searchQuerySchema,
  columns: z.array(z.string()).optional(),
  period: z.enum(periodValues).optional(),
  elements: z.array(z.string()).optional(),
  benchmark: z.string().optional(),
  chart: z.enum(['line', 'area', 'bar', 'normalized']).optional(),
})

export type ViewConfig = z.infer<typeof viewConfigSchema>
export type ViewSurface = (typeof viewSurfaces)[number]
export type ViewPeriod = (typeof periodValues)[number]
export type SearchQuery = ViewConfig['query']

export function parseViewConfig({ value }: { value: unknown }): ViewConfig | null {
  const parsed = viewConfigSchema.safeParse(value)
  if (!parsed.success) return null
  return parsed.data
}

export function viewFromSearchQuery({
  query,
  title,
  surface = 'table',
  period,
  columns,
  elements,
}: {
  query: SearchQuery
  title: string
  surface?: ViewSurface
  period?: ViewPeriod | null
  columns?: string[]
  elements?: string[]
}): ViewConfig {
  return {
    version: 1,
    surface,
    title,
    query,
    ...(period ? { period } : {}),
    ...(columns?.length ? { columns } : {}),
    ...(elements?.length ? { elements } : {}),
  }
}
