import { describe, expect, it } from "vitest";

import { seriesAssetId } from "./series";
import { defaultSearchQuery } from "./view-config";

describe("seriesAssetId", () => {
  it("defaults to bitcoin when the query has no symbols or highlight", () => {
    expect(seriesAssetId({ query: defaultSearchQuery, coins: [] })).toBe(
      "bitcoin"
    );
  });

  it("resolves a ticker against listed coins, else the first symbol", () => {
    expect(
      seriesAssetId({
        query: { ...defaultSearchQuery, symbols: ["eth"] },
        coins: [
          {
            id: "ethereum",
            symbol: "eth",
            name: "Ethereum",
            imageUrl: null,
            priceUsd: 1,
            change24h: 0,
            change7d: 1.2,
            sparkline7d: [1, 2, 3],
            volumeUsd: 0,
            marketCapUsd: 0,
            rank: 2,
            fetchedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      })
    ).toBe("ethereum");
  });

  it("prefers focus over symbols", () => {
    expect(
      seriesAssetId({
        query: { ...defaultSearchQuery, symbols: ["eth"] },
        coins: [],
        focus: "solana",
      })
    ).toBe("solana");
  });
});
