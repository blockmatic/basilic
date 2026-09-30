import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

const csvKeys = ["symbols", "highlight"] as const;
const numberKeys = [
  "topN",
  "minChangePct",
  "maxChangePct",
  "minPrice",
  "maxPrice",
] as const;

export const SearchQuerySchema = Type.Object({
  highlight: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  maxChangePct: Type.Optional(Type.Number()),
  maxPrice: Type.Optional(Type.Number()),
  minChangePct: Type.Optional(Type.Number()),
  minPrice: Type.Optional(Type.Number()),
  sortBy: Type.Optional(
    Type.Union([
      Type.Literal("rank"),
      Type.Literal("change24h"),
      Type.Literal("volume"),
      Type.Literal("marketCap"),
      Type.Literal("price"),
    ])
  ),
  sortDir: Type.Optional(
    Type.Union([Type.Literal("asc"), Type.Literal("desc")])
  ),
  symbols: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  text: Type.Optional(Type.String({ minLength: 1 })),
  topN: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  universe: Type.Optional(
    Type.Union([
      Type.Literal("all"),
      Type.Literal("majors"),
      Type.Literal("watchlist"),
    ])
  ),
});

export type SearchQueryInput = Static<typeof SearchQuerySchema>;

export interface SearchQuery {
  universe: "all" | "majors" | "watchlist";
  sortBy: "rank" | "change24h" | "volume" | "marketCap" | "price";
  sortDir: "asc" | "desc";
  symbols?: string[];
  text?: string;
  topN?: number;
  minChangePct?: number;
  maxChangePct?: number;
  minPrice?: number;
  maxPrice?: number;
  highlight?: string[];
}

export const CoinDtoSchema = Type.Object({
  change24h: Type.Number(),
  change7d: Type.Union([Type.Number(), Type.Null()]),
  fetchedAt: Type.String({ format: "date-time" }),
  highlighted: Type.Boolean(),
  id: Type.String(),
  imageUrl: Type.Union([Type.String(), Type.Null()]),
  marketCapUsd: Type.Number(),
  name: Type.String(),
  priceUsd: Type.Number(),
  rank: Type.Integer(),
  sparkline7d: Type.Array(Type.Number()),
  symbol: Type.String(),
  volumeUsd: Type.Number(),
});

export const CoinSyncSchema = Type.Object({
  attribution: Type.Optional(Type.String()),
  fetchedAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
  lastError: Type.Union([Type.String(), Type.Null()]),
  source: Type.String(),
  stale: Type.Optional(Type.Boolean()),
});

export const QueryCoinsResponseSchema = Type.Object({
  coins: Type.Array(CoinDtoSchema),
  query: SearchQuerySchema,
  queryCaption: Type.String(),
  spokenSummary: Type.String(),
  sync: CoinSyncSchema,
});

function splitCsv({ value }: { value: string }): string[] {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeSymbols({
  values,
}: {
  values?: string[];
}): string[] | undefined {
  if (!values?.length) {
    return undefined;
  }
  const next = [
    ...new Set(
      values.map((value) => value.trim().toLowerCase()).filter(Boolean)
    ),
  ];
  return next.length > 0 ? next : undefined;
}

export function coerceSearchQuerystring({
  query,
}: {
  query: Record<string, unknown>;
}): void {
  for (const key of csvKeys) {
    const value = query[key];
    if (typeof value === "string") {
      query[key] = splitCsv({ value });
    } else if (Array.isArray(value)) {
      query[key] = value.flatMap((item) =>
        typeof item === "string" ? splitCsv({ value: item }) : []
      );
    }
  }
  for (const key of numberKeys) {
    const value = query[key];
    if (typeof value !== "string") {
      continue;
    }
    if (value.trim() === "") {
      delete query[key];
      continue;
    }
    const n = Number(value);
    if (Number.isFinite(n)) {
      query[key] = n;
    }
  }
}

export function normalizeSearchQuery({
  query,
}: {
  query: SearchQueryInput;
}): SearchQuery {
  const symbols = normalizeSymbols({ values: query.symbols });
  const highlight = normalizeSymbols({ values: query.highlight });
  const text = query.text?.trim();
  return {
    sortBy: query.sortBy ?? "rank",
    sortDir: query.sortDir ?? "asc",
    universe: query.universe ?? "all",
    ...(symbols ? { symbols } : {}),
    ...(text ? { text } : {}),
    ...(query.topN == null ? {} : { topN: query.topN }),
    ...(query.minChangePct == null ? {} : { minChangePct: query.minChangePct }),
    ...(query.maxChangePct == null ? {} : { maxChangePct: query.maxChangePct }),
    ...(query.minPrice == null ? {} : { minPrice: query.minPrice }),
    ...(query.maxPrice == null ? {} : { maxPrice: query.maxPrice }),
    ...(highlight ? { highlight } : {}),
  };
}
