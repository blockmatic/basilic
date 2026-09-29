import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { inferParserType } from "nuqs/server";

import {
  clearedSearchQuery,
  searchQueryParsers,
} from "@/lib/coins/search-query";
import type { SearchQueryState } from "@/lib/coins/search-query";

import { chartKinds, periodValues, viewSurfaces } from "./view-config";

const viewFieldOptions = { clearOnDefault: true } as const;

export const surfaceParsers = {
  surface: parseAsStringLiteral(viewSurfaces)
    .withDefault("table")
    .withOptions(viewFieldOptions),
  period: parseAsStringLiteral(periodValues).withOptions(viewFieldOptions),
  chart: parseAsStringLiteral(chartKinds).withOptions(viewFieldOptions),
  focus: parseAsString.withOptions(viewFieldOptions),
  columns: parseAsArrayOf(parseAsString)
    .withDefault([])
    .withOptions(viewFieldOptions),
  elements: parseAsArrayOf(parseAsString)
    .withDefault([])
    .withOptions(viewFieldOptions),
};

export const boardViewParsers = {
  ...searchQueryParsers,
  ...surfaceParsers,
};

export type BoardViewState = inferParserType<typeof boardViewParsers>;

export const whoamiViewPatch = {
  ...clearedSearchQuery,
  chart: null,
  columns: null,
  elements: null,
  focus: null,
  period: null,
  surface: "account",
  universe: "watchlist",
} as const;

export function splitBoardView({ view }: { view: BoardViewState }): {
  query: SearchQueryState;
  surface: BoardViewState["surface"];
  period: BoardViewState["period"];
  chart: BoardViewState["chart"];
  focus: BoardViewState["focus"];
  columns: BoardViewState["columns"];
  elements: BoardViewState["elements"];
} {
  const { surface, period, chart, focus, columns, elements, ...query } = view;
  return { chart, columns, elements, focus, period, query, surface };
}
