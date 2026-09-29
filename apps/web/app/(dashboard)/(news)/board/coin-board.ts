import type { Spec } from "@json-render/core";

import type { CoinMarket, MarketsSync } from "@/lib/coins/board";
import type { ChromeState } from "@/lib/coins/chrome";
import { isSameSearchQuery } from "@/lib/coins/search-query";
import type { SearchQueryState } from "@/lib/coins/search-query";
import type {
  AccountState,
  ViewChart,
  ViewPeriod,
  ViewSurface,
} from "@/lib/genui";
import type { GlobalState, TrendingState } from "@/lib/genui/overview";

export interface CoinBoardProps {
  spec: Spec;
  initialQuery: SearchQueryState;
  initialSurface: ViewSurface;
  initialPeriod: ViewPeriod | null;
  initialChart: ViewChart | null;
  initialFocus: string | null;
  initialColumns: string[];
  initialElements: string[];
  initialChrome: ChromeState;
  initialAccount: AccountState;
  initialCoins: CoinMarket[];
  initialSync: MarketsSync;
  initialCaption: string;
  initialError: string | null;
  initialWatchedIds: string[];
  initialGlobal: GlobalState;
  initialTrending: TrendingState;
}

export function isInitialBoardView({
  query,
  surface,
  period,
  chart,
  focus,
  columns,
  elements,
  initialQuery,
  initialSurface,
  initialPeriod,
  initialChart,
  initialFocus,
  initialColumns,
  initialElements,
}: {
  query: SearchQueryState;
  surface: ViewSurface;
  period: ViewPeriod | null;
  chart: ViewChart | null;
  focus: string | null;
  columns: string[];
  elements: string[];
  initialQuery: SearchQueryState;
  initialSurface: ViewSurface;
  initialPeriod: ViewPeriod | null;
  initialChart: ViewChart | null;
  initialFocus: string | null;
  initialColumns: string[];
  initialElements: string[];
}) {
  return (
    surface === initialSurface &&
    period === initialPeriod &&
    chart === initialChart &&
    focus === initialFocus &&
    columns.length === initialColumns.length &&
    columns.every((id, index) => id === initialColumns[index]) &&
    elements.length === initialElements.length &&
    elements.every((id, index) => id === initialElements[index]) &&
    isSameSearchQuery({ a: query, b: initialQuery })
  );
}
