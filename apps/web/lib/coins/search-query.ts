import type { ListCoinsData } from "@repo/core";
import {
  sortByValues,
  sortDirValues,
  universeValues,
} from "@repo/utils/view-config";
import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { inferParserType } from "nuqs/server";

export const searchQueryParsers = {
  highlight: parseAsArrayOf(parseAsString)
    .withDefault([])
    .withOptions({ clearOnDefault: true }),
  maxChangePct: parseAsFloat,
  maxPrice: parseAsFloat,
  minChangePct: parseAsFloat,
  minPrice: parseAsFloat,
  sortBy: parseAsStringLiteral(sortByValues)
    .withDefault("rank")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringLiteral(sortDirValues).withDefault("asc").withOptions({
    clearOnDefault: true,
  }),
  symbols: parseAsArrayOf(parseAsString)
    .withDefault([])
    .withOptions({ clearOnDefault: true }),
  text: parseAsString,
  topN: parseAsInteger,
  universe: parseAsStringLiteral(universeValues)
    .withDefault("all")
    .withOptions({
      clearOnDefault: true,
    }),
};

export type SearchQueryState = inferParserType<typeof searchQueryParsers>;

export const clearedSearchQuery = {
  highlight: null,
  maxChangePct: null,
  maxPrice: null,
  minChangePct: null,
  minPrice: null,
  sortBy: null,
  sortDir: null,
  symbols: null,
  text: null,
  topN: null,
  universe: null,
} as const;

function compactStrings({ values }: { values: string[] }): string[] {
  return [
    ...new Set(
      values.map((value) => value.trim().toLowerCase()).filter(Boolean)
    ),
  ];
}

export function toCoinsQuery({
  query,
}: {
  query: SearchQueryState;
}): NonNullable<ListCoinsData["query"]> {
  const symbols = compactStrings({ values: query.symbols });
  const highlight = compactStrings({ values: query.highlight });
  const text = query.text?.trim();
  return {
    ...(query.universe === "all" ? {} : { universe: query.universe }),
    ...(query.sortBy === "rank" ? {} : { sortBy: query.sortBy }),
    ...(query.sortDir === "asc" ? {} : { sortDir: query.sortDir }),
    ...(symbols.length > 0 ? { symbols } : {}),
    ...(highlight.length > 0 ? { highlight } : {}),
    ...(text ? { text } : {}),
    ...(query.topN == null ? {} : { topN: query.topN }),
    ...(query.minChangePct == null ? {} : { minChangePct: query.minChangePct }),
    ...(query.maxChangePct == null ? {} : { maxChangePct: query.maxChangePct }),
    ...(query.minPrice == null ? {} : { minPrice: query.minPrice }),
    ...(query.maxPrice == null ? {} : { maxPrice: query.maxPrice }),
  };
}

export function isSameSearchQuery({
  a,
  b,
}: {
  a: SearchQueryState;
  b: SearchQueryState;
}): boolean {
  return (
    JSON.stringify(toCoinsQuery({ query: a })) ===
    JSON.stringify(toCoinsQuery({ query: b }))
  );
}
