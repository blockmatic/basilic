/** Keep patches aligned with T6 chips in apps/web board/chips.tsx and G2 whoamiViewPatch. Do not import the web module. */

export const cannedIntents = [
  'movers',
  'losers',
  'volume',
  'majors',
  'watchlist',
  'reset',
  'whoami',
  'other',
] as const

export type CannedIntent = (typeof cannedIntents)[number]

export const cannedSearchPatches = {
  movers: { sortBy: 'change24h', sortDir: 'desc' },
  losers: { sortBy: 'change24h', sortDir: 'asc' },
  volume: { sortBy: 'volume', sortDir: 'desc' },
  majors: { universe: 'majors' },
  watchlist: { universe: 'watchlist' },
  reset: {},
  whoami: { universe: 'watchlist', surface: 'account' },
  other: null,
} as const

export function cannedSearchPatch({ intent }: { intent: CannedIntent }) {
  return cannedSearchPatches[intent]
}
