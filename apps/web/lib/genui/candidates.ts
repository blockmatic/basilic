import type { ColumnId, ViewConfig, ViewSurface } from "./view-config";

const leaf = { children: [] as string[] };

export const rankedColumns: ColumnId[] = [
  "rank",
  "identity",
  "price",
  "change24h",
  "spark7d",
  "marketCap",
  "volume",
  "watch",
];
export const moversColumns: ColumnId[] = [
  "identity",
  "price",
  "change24h",
  "spark7d",
  "volume",
  "watch",
];
export const comparisonColumns: ColumnId[] = [
  "identity",
  "price",
  "change24h",
  "spark7d",
  "marketCap",
  "watch",
];

export const honestyBySurface: Partial<Record<ViewSurface, string>> = {
  account:
    "Your profile. Favorites below. Linked wallet tokens load live from Alchemy.",
  chart: "No Binance market for this asset. Showing the table.",
  coin: "No coin page yet. Highlighting that row.",
  dashboard: "Ephemeral overview. Nothing is pinned.",
  news: "Headlines aren't a generated surface yet.",
};

export const honestyCandidateIds = {
  account: "honesty-account",
  chart: "honesty-chart",
  coin: "honesty-coin",
  dashboard: "honesty-dashboard",
  news: "honesty-news",
} as const satisfies Partial<Record<ViewSurface, string>>;

const summaryElement = {
  props: { caption: { $state: "/caption" } },
  type: "QuerySummary",
};

const accountElement = {
  props: {
    email: { $state: "/account/email" },
    image: { $state: "/account/image" },
    joinedAt: { $state: "/account/joinedAt" },
    name: { $state: "/account/name" },
    username: { $state: "/account/username" },
  },
  type: "UserInfo",
};

const resetElement = {
  on: { press: { action: "reset_view" } },
  props: { label: "Reset view", variant: "outline" },
  type: "Button",
};

function honestyElement({ title }: { title: string }) {
  return {
    props: { description: null, title, variant: "default" },
    type: "Alert",
  };
}

function tableElement({ columns }: { columns: ColumnId[] }) {
  return {
    props: { columns, emptyLabel: "No market data available." },
    type: "DataTable",
  };
}

const tokenTableElement = {
  props: { network: "all" as const },
  type: "TokenTable",
};

const nftGridElement = {
  props: { hidden: false },
  type: "NftGrid",
};

const walletLinkElement = {
  props: {
    text: "Link an Ethereum wallet in Settings to load tokens.",
    tone: "muted" as const,
  },
  type: "Text",
};

const trendingTableElement = {
  props: {},
  type: "TrendingTable",
};

function metricElement({
  field,
  label,
}: {
  field: "btcDominance" | "marketCapUsd" | "volumeUsd";
  label: string;
}) {
  return { props: { field, label }, type: "MetricTile" };
}

export const boardRecipes = {
  account: { description: "Signed-in profile card", element: accountElement },
  "chart-area": {
    description: "Close price area chart bound to $state.series",
    element: { props: {}, type: "AreaChart" },
  },
  "chart-bar": {
    description: "Close price bar chart bound to $state.series",
    element: { props: {}, type: "BarChart" },
  },
  "chart-line": {
    description: "Close price line chart bound to $state.series",
    element: { props: { scale: "price" as const }, type: "LineChart" },
  },
  "chart-normalized": {
    description: "Normalized close line chart bound to $state.series",
    element: { props: { scale: "normalized" as const }, type: "LineChart" },
  },
  "honesty-account": {
    description: "Honesty notice under the account card",
    element: honestyElement({ title: honestyBySurface.account ?? "" }),
  },
  "honesty-chart": {
    description: "Honesty notice when this asset has no Binance pair",
    element: honestyElement({ title: honestyBySurface.chart ?? "" }),
  },
  "honesty-coin": {
    description: "Honesty notice that coin pages are not shipped",
    element: honestyElement({ title: honestyBySurface.coin ?? "" }),
  },
  "honesty-dashboard": {
    description: "Honesty notice that overview widgets are not pinned",
    element: honestyElement({ title: honestyBySurface.dashboard ?? "" }),
  },
  "honesty-news": {
    description: "Honesty notice that headlines are not a generated surface",
    element: honestyElement({ title: honestyBySurface.news ?? "" }),
  },
  "metric-btc-d": {
    description: "BTC.D metric tile bound to $state.global",
    element: metricElement({ field: "btcDominance", label: "BTC dominance" }),
  },
  "metric-market-cap": {
    description: "Total crypto market cap tile bound to $state.global",
    element: metricElement({
      field: "marketCapUsd",
      label: "Total market cap",
    }),
  },
  "metric-volume": {
    description: "Global 24h volume tile bound to $state.global",
    element: metricElement({ field: "volumeUsd", label: "24h volume" }),
  },
  "nft-grid": {
    description: "Linked wallet NFTs as a grid",
    element: nftGridElement,
  },
  "nft-hide": {
    description: "Hide NFT grid",
    element: { props: { hidden: true }, type: "NftGrid" },
  },
  reset: {
    description: "Clear filters back to the ranked table",
    element: resetElement,
  },
  summary: {
    description: "Caption of the current SearchQuery",
    element: summaryElement,
  },
  "table-comparison": {
    description: "Short comparison table for a few symbols",
    element: tableElement({ columns: comparisonColumns }),
  },
  "table-movers": {
    description: "Movers table emphasizing 24h change and volume",
    element: tableElement({ columns: moversColumns }),
  },
  "table-ranked": {
    description: "Ranked market table with cap, volume, and watch",
    element: tableElement({ columns: rankedColumns }),
  },
  "table-trending": {
    description: "Trending coins bound to $state.trending",
    element: trendingTableElement,
  },
  "table-watchlist": {
    description: "Favorites table; empty watchlist stays honest",
    element: tableElement({ columns: rankedColumns }),
  },
  "token-table-all": {
    description: "Linked wallet tokens on eth and base",
    element: tokenTableElement,
  },
  "token-table-base": {
    description: "Linked wallet tokens on Base",
    element: {
      props: { network: "base-mainnet" as const },
      type: "TokenTable",
    },
  },
  "token-table-eth": {
    description: "Linked wallet tokens on Ethereum",
    element: { props: { network: "eth-mainnet" as const }, type: "TokenTable" },
  },
  "wallet-link-cta": {
    description: "Prompt to link an Ethereum wallet in Settings",
    element: walletLinkElement,
  },
} as const;

export const tableCandidateIds = [
  "table-ranked",
  "table-movers",
  "table-comparison",
  "table-watchlist",
] as const;

export const chartCandidateIds = [
  "chart-line",
  "chart-area",
  "chart-bar",
  "chart-normalized",
] as const;

export const metricCandidateIds = [
  "metric-btc-d",
  "metric-market-cap",
  "metric-volume",
] as const;

export const overviewCandidateIds = [
  ...metricCandidateIds,
  "table-trending",
] as const;

export type BoardRecipeId = keyof typeof boardRecipes;

export const recipeIdSet = new Set<string>(Object.keys(boardRecipes));

export function isBoardRecipeId(id: string): id is BoardRecipeId {
  return recipeIdSet.has(id);
}

export function isTableRecipeId(
  id: string
): id is (typeof tableCandidateIds)[number] {
  return tableCandidateIds.includes(id as (typeof tableCandidateIds)[number]);
}

export function isChartRecipeId(
  id: string
): id is (typeof chartCandidateIds)[number] {
  return chartCandidateIds.includes(id as (typeof chartCandidateIds)[number]);
}

export function isOverviewRecipeId(
  id: string
): id is (typeof overviewCandidateIds)[number] {
  return overviewCandidateIds.includes(
    id as (typeof overviewCandidateIds)[number]
  );
}

export function honestyIdForSurface({
  surface,
}: {
  surface: ViewSurface;
}): (typeof honestyCandidateIds)[keyof typeof honestyCandidateIds] | undefined {
  if (surface === "chart") {
    return honestyCandidateIds.chart;
  }
  if (surface === "news") {
    return honestyCandidateIds.news;
  }
  if (surface === "coin") {
    return honestyCandidateIds.coin;
  }
  if (surface === "account") {
    return honestyCandidateIds.account;
  }
  return undefined;
}

export function tableEmptyLabel({ view }: { view: ViewConfig }): string | null {
  return view.query.universe === "watchlist"
    ? null
    : "No market data available.";
}

export function recipeSpecElement({
  id,
  view,
}: {
  id: BoardRecipeId;
  view: ViewConfig;
}) {
  const recipe = boardRecipes[id];
  const { element } = recipe;
  if (element.type !== "DataTable") {
    return { ...element, ...leaf };
  }
  return {
    ...element,
    props: { ...element.props, emptyLabel: tableEmptyLabel({ view }) },
    ...leaf,
  };
}
