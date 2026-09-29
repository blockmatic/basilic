import type { ViewSurface } from '@repo/utils/view-config'
import type { SearchQueryState } from '@/lib/coins/search-query'

export {
  defaultSearchQuery,
  parseViewConfig,
  periodValues,
  type ViewConfig,
  type ViewPeriod,
  type ViewSurface,
  viewConfigSchema,
  viewFromSearchQuery,
  viewSurfaces,
} from '@repo/utils/view-config'

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
  if (surface === 'dashboard') return caption || 'Market overview'
  return caption
}
