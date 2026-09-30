import type { getDb } from "@repo/db";
import {
  assetMarkets,
  assetNetworks,
  assetProviders,
  assets,
} from "@repo/db/schema";
import { fixtureQuotes } from "@repo/markets";

export type CoinsDb = Awaited<ReturnType<typeof getDb>>;

const binancePairs: Record<string, { symbol: string; quote: string }> = {
  "avalanche-2": { quote: "USDT", symbol: "AVAXUSDT" },
  binancecoin: { quote: "USDT", symbol: "BNBUSDT" },
  bitcoin: { quote: "USDT", symbol: "BTCUSDT" },
  "bitcoin-cash": { quote: "USDT", symbol: "BCHUSDT" },
  cardano: { quote: "USDT", symbol: "ADAUSDT" },
  chainlink: { quote: "USDT", symbol: "LINKUSDT" },
  dogecoin: { quote: "USDT", symbol: "DOGEUSDT" },
  ethereum: { quote: "USDT", symbol: "ETHUSDT" },
  litecoin: { quote: "USDT", symbol: "LTCUSDT" },
  near: { quote: "USDT", symbol: "NEARUSDT" },
  polkadot: { quote: "USDT", symbol: "DOTUSDT" },
  ripple: { quote: "USDT", symbol: "XRPUSDT" },
  "shiba-inu": { quote: "USDT", symbol: "SHIBUSDT" },
  solana: { quote: "USDT", symbol: "SOLUSDT" },
  stellar: { quote: "USDT", symbol: "XLMUSDT" },
  sui: { quote: "USDT", symbol: "SUIUSDT" },
  tron: { quote: "USDT", symbol: "TRXUSDT" },
  uniswap: { quote: "USDT", symbol: "UNIUSDT" },
  "usd-coin": { quote: "USDT", symbol: "USDCUSDT" },
};

export const binanceCatalogPairCount = Object.keys(binancePairs).length;

export async function seedIdentity({ db }: { db: CoinsDb }): Promise<void> {
  const now = new Date();
  await db.transaction(async (tx) => {
    for (const row of fixtureQuotes) {
      await tx
        .insert(assets)
        .values({
          id: row.id,
          symbol: row.symbol,
          name: row.name,
          imageUrl: row.imageUrl,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: assets.id,
          set: {
            symbol: row.symbol,
            name: row.name,
            imageUrl: row.imageUrl,
            updatedAt: now,
          },
        });
    }

    for (const row of fixtureQuotes) {
      await tx
        .insert(assetProviders)
        .values({
          assetId: row.id,
          id: `coingecko:${row.id}`,
          provider: "coingecko",
          providerId: row.id,
        })
        .onConflictDoUpdate({
          set: { assetId: row.id, provider: "coingecko", providerId: row.id },
          target: assetProviders.id,
        });

      const pair = binancePairs[row.id];
      if (!pair) {
        continue;
      }
      await tx
        .insert(assetMarkets)
        .values({
          assetId: row.id,
          id: `binance:${pair.symbol}`,
          provider: "binance",
          quote: pair.quote,
          symbol: pair.symbol,
        })
        .onConflictDoUpdate({
          set: {
            assetId: row.id,
            provider: "binance",
            quote: pair.quote,
            symbol: pair.symbol,
          },
          target: assetMarkets.id,
        });
    }

    await tx
      .insert(assetNetworks)
      .values({
        assetId: "ethereum",
        chainCaip2: "eip155:1",
        contractAddress: null,
        decimals: 18,
        id: "eip155:1:native",
        isNative: true,
      })
      .onConflictDoUpdate({
        set: {
          assetId: "ethereum",
          chainCaip2: "eip155:1",
          contractAddress: null,
          decimals: 18,
          isNative: true,
        },
        target: assetNetworks.id,
      });
  });
}

export async function seedIdentityIfEmpty({
  db,
}: {
  db: CoinsDb;
}): Promise<void> {
  const existing = await db.select({ id: assets.id }).from(assets);
  const have = new Set(existing.map((row) => row.id));
  if (fixtureQuotes.some((row) => !have.has(row.id))) {
    await seedIdentity({ db });
  }
}
