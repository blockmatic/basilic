import { z } from 'zod'
import type { SearchQueryState } from '@/lib/coins/search-query'

export const columnIds = [
  'rank',
  'identity',
  'price',
  'change24h',
  'marketCap',
  'volume',
  'watch',
] as const

export type ColumnId = (typeof columnIds)[number]

export const defaultSearchQuery = {
  universe: 'all',
  sortBy: 'rank',
  sortDir: 'asc',
  symbols: [],
  highlight: [],
  text: null,
  topN: null,
  minChangePct: null,
  maxChangePct: null,
  minPrice: null,
  maxPrice: null,
} satisfies SearchQueryState

const searchQuerySchema = z.object({
  universe: z.enum(['all', 'majors', 'watchlist']),
  sortBy: z.enum(['rank', 'change24h', 'volume', 'marketCap', 'price']),
  sortDir: z.enum(['asc', 'desc']),
  symbols: z.array(z.string()),
  highlight: z.array(z.string()),
  text: z.string().nullable(),
  topN: z.number().nullable(),
  minChangePct: z.number().nullable(),
  maxChangePct: z.number().nullable(),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
})

export const viewConfigSchema = z.object({
  version: z.literal(1),
  surface: z.enum([
    'table',
    'screener',
    'comparison',
    'chart',
    'news',
    'dashboard',
    'coin',
    'account',
  ]),
  title: z.string(),
  query: searchQuerySchema,
  columns: z.array(z.string()).optional(),
  period: z.enum(['24h', '7d', '30d', '90d', '1y', '6m']).optional(),
  benchmark: z.string().optional(),
  chart: z.enum(['line', 'area', 'bar', 'normalized']).optional(),
})

export type ViewConfig = z.infer<typeof viewConfigSchema>
export type ViewSurface = ViewConfig['surface']

export function parseViewConfig({ value }: { value: unknown }): ViewConfig | null {
  const parsed = viewConfigSchema.safeParse(value)
  if (!parsed.success) return null
  return parsed.data
}

export function viewFromSearchQuery({
  query,
  title,
  surface = 'table',
}: {
  query: SearchQueryState
  title: string
  surface?: ViewSurface
}): ViewConfig {
  return { version: 1, surface, title, query }
}
