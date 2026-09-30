import type { ViewSurface } from "@repo/utils/view-config";

import type { SearchQueryState } from "@/lib/coins/search-query";

export {
  chartKinds,
  defaultSearchQuery,
  parseViewConfig,
  periodValues,
  type ViewChart,
  type ViewConfig,
  type ViewPeriod,
  type ViewSurface,
  viewConfigSchema,
  viewFromSearchQuery,
  viewSurfaces,
} from "@repo/utils/view-config";

export const columnIds = [
  "rank",
  "identity",
  "price",
  "change24h",
  "spark7d",
  "marketCap",
  "volume",
  "watch",
] as const;

export type ColumnId = (typeof columnIds)[number];

export interface AccountState {
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  joinedAt: string | null;
}

export const emptyAccountState: AccountState = {
  email: null,
  image: null,
  joinedAt: null,
  name: null,
  username: null,
};

export function accountFromUser({
  user,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
  } | null;
}): AccountState {
  if (!user) {
    return emptyAccountState;
  }
  return {
    email: user.email ?? null,
    image: null,
    joinedAt: null,
    name: user.name ?? null,
    username: user.username ?? null,
  };
}

export function overlayAccountQuery({
  query,
  surface,
}: {
  query: SearchQueryState;
  surface: ViewSurface;
}): SearchQueryState {
  if (surface !== "account") {
    return query;
  }
  return { ...query, universe: "watchlist" };
}

export function viewTitle({
  surface,
  caption,
}: {
  surface: ViewSurface;
  caption: string;
}): string {
  if (surface === "account") {
    return caption || "Your profile";
  }
  if (surface === "dashboard") {
    return caption || "Market overview";
  }
  return caption;
}
