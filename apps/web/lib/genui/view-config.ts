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

export type AccountState = {
  name: string | null
  email: string | null
  image: string | null
  username: string | null
  joinedAt: string | null
}

export const emptyAccountState: AccountState = {
  name: null,
  email: null,
  image: null,
  username: null,
  joinedAt: null,
}

export function accountFromUser({
  user,
}: {
  user: { name?: string | null; email?: string | null; username?: string | null } | null
}): AccountState {
  if (!user) return emptyAccountState
  return {
    name: user.name ?? null,
    email: user.email ?? null,
    username: user.username ?? null,
    image: null,
    joinedAt: null,
  }
}

export function overlayAccountQuery({
  query,
  surface,
}: {
  query: SearchQueryState
  surface: ViewSurface
}): SearchQueryState {
  if (surface !== 'account') return query
  return { ...query, universe: 'watchlist' }
}

export function viewTitle({ surface, caption }: { surface: ViewSurface; caption: string }): string {
  if (surface === 'account') return caption || 'Your profile'
  return caption
}

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
  query: SearchQueryState
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
