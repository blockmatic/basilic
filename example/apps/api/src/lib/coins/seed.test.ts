import { getDb } from "@repo/db";
import {
  assetMarkets,
  assetNetworks,
  assetProviders,
  assets,
  coinWatches,
} from "@repo/db/schema";
import { fixtureQuotes } from "@repo/markets";
import { count, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  binanceCatalogPairCount,
  seedIdentity,
  seedIdentityIfEmpty,
} from "./seed.js";

describe("seedIdentity", () => {
  it("upserts identity rows without duplicating", async () => {
    const db = await getDb();
    await seedIdentity({ db });
    await seedIdentity({ db });

    const [row] = await db.select({ n: count() }).from(assets);
    expect(row?.n).toBe(fixtureQuotes.length);

    const ids = (await db.select({ id: assets.id }).from(assets)).map(
      (item) => item.id
    );
    expect(ids).toEqual(
      expect.arrayContaining(["bitcoin", "ethereum", "solana"])
    );

    const [providers] = await db.select({ n: count() }).from(assetProviders);
    expect(providers?.n).toBe(fixtureQuotes.length);

    const [markets] = await db.select({ n: count() }).from(assetMarkets);
    expect(markets?.n).toBe(binanceCatalogPairCount);

    const [native] = await db
      .select()
      .from(assetNetworks)
      .where(eq(assetNetworks.id, "eip155:1:native"));
    expect(native?.assetId).toBe("ethereum");
    expect(native?.isNative).toBe(true);
    expect(native?.chainCaip2).toBe("eip155:1");
  });

  it("upserts missing catalog rows when the registry is short", async () => {
    const db = await getDb();
    await db.delete(coinWatches);
    await db.delete(assetMarkets);
    await db.delete(assetNetworks);
    await db.delete(assetProviders);
    await db.delete(assets);
    await db.insert(assets).values({
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      imageUrl: null,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await seedIdentityIfEmpty({ db });

    const [row] = await db.select({ n: count() }).from(assets);
    expect(row?.n).toBe(fixtureQuotes.length);
  });

  it("inserts missing catalog ids when the row count is already full", async () => {
    const db = await getDb();
    await db.delete(coinWatches);
    await db.delete(assetMarkets);
    await db.delete(assetNetworks);
    await db.delete(assetProviders);
    await db.delete(assets);
    const now = new Date();
    await db.insert(assets).values(
      Array.from({ length: fixtureQuotes.length }, (_, index) => ({
        id: `extra-${index}`,
        symbol: `x${index}`,
        name: `Extra ${index}`,
        imageUrl: null,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      }))
    );

    await seedIdentityIfEmpty({ db });

    const ids = (await db.select({ id: assets.id }).from(assets)).map(
      (item) => item.id
    );
    expect(ids).toEqual(
      expect.arrayContaining(fixtureQuotes.map((row) => row.id))
    );
  });

  it("does not re-enable a disabled catalog asset on upsert", async () => {
    const db = await getDb();
    await seedIdentity({ db });
    await db
      .update(assets)
      .set({ enabled: false })
      .where(eq(assets.id, "bitcoin"));
    await seedIdentity({ db });
    const [bitcoin] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, "bitcoin"));
    expect(bitcoin?.enabled).toBe(false);
  });
});
