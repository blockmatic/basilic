/** Keep patches aligned with board SearchQuery filters and G2 whoamiViewPatch. Do not import the web module. */

export const cannedIntents = [
  "movers",
  "losers",
  "volume",
  "majors",
  "watchlist",
  "reset",
  "whoami",
  "other",
] as const;

export type CannedIntent = (typeof cannedIntents)[number];

export const cannedSearchPatches = {
  losers: { sortBy: "change24h", sortDir: "asc" },
  majors: { universe: "majors" },
  movers: { sortBy: "change24h", sortDir: "desc" },
  other: null,
  reset: {},
  volume: { sortBy: "volume", sortDir: "desc" },
  watchlist: { universe: "watchlist" },
  whoami: { surface: "account", universe: "watchlist" },
} as const;

export function cannedSearchPatch({ intent }: { intent: CannedIntent }) {
  return cannedSearchPatches[intent];
}
