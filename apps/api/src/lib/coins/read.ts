import { assets } from "@repo/db/schema";
import { getMarkets } from "@repo/markets";
import type { MarketRow, Provenance } from "@repo/markets";
import { eq } from "drizzle-orm";

import { seedIdentityIfEmpty } from "./seed.js";
import type { CoinsDb } from "./seed.js";

const coinGeckoAttribution = "Data by CoinGecko";

function toCoinDto({
  asset,
  quote,
}: {
  asset: { id: string; symbol: string; name: string; imageUrl: string | null };
  quote: MarketRow;
}) {
  return {
    change24h: quote.change24h,
    change7d: quote.change7d,
    fetchedAt: quote.fetchedAt,
    id: asset.id,
    imageUrl: asset.imageUrl ?? quote.imageUrl,
    marketCapUsd: quote.marketCapUsd,
    name: asset.name,
    priceUsd: quote.priceUsd,
    rank: quote.rank,
    sparkline7d: quote.sparkline7d,
    symbol: asset.symbol,
    volumeUsd: quote.volumeUsd,
  };
}

function toSync({
  source,
  markets,
}: {
  source: Provenance;
  markets: MarketRow[];
}) {
  const fetchedAt =
    source === "fixture"
      ? null
      : (markets.find((row) => row.fetchedAt)?.fetchedAt ??
        new Date().toISOString());
  return {
    fetchedAt,
    lastError: null,
    source,
    ...(source === "stale" ? { stale: true } : {}),
    ...(source === "live" ? { attribution: coinGeckoAttribution } : {}),
  };
}

export async function listMarkets({ db }: { db: CoinsDb }) {
  await seedIdentityIfEmpty({ db });

  const rows = await db.select().from(assets).where(eq(assets.enabled, true));
  const ids = rows.map((row) => row.id);
  const { markets, source } = await getMarkets({
    ids,
    sparkline: true,
    topN: ids.length || undefined,
  });
  const quotes = new Map(markets.map((quote) => [quote.id, quote]));
  const coins = rows
    .flatMap((asset) => {
      const quote = quotes.get(asset.id);
      if (!quote) {
        return [];
      }
      return [toCoinDto({ asset, quote })];
    })
    .sort((a, b) => a.rank - b.rank || a.id.localeCompare(b.id));

  return { coins, sync: toSync({ markets, source }) };
}
