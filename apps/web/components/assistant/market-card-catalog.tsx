"use client";

import { defineCatalog } from "@json-render/core";
import { defineRegistry, schema } from "@json-render/react";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { z } from "zod";

const moverSchema = z.object({
  change24h: z.number(),
  name: z.string(),
  price: z.number(),
  symbol: z.string(),
});

export const marketCardCatalog = defineCatalog(schema, {
  actions: {},
  components: {
    MarketCard: {
      description: "Market movers card with prices and 24h change",
      props: z.object({
        headline: z.string(),
        source: z.enum(["live", "fixture"]),
        movers: z.array(moverSchema),
      }),
    },
  },
});

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: n < 0.01 ? 6 : 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(n);
}

function MarketCardComponent({
  props,
}: {
  props: {
    headline: string;
    source: "live" | "fixture";
    movers: {
      symbol: string;
      name: string;
      price: number;
      change24h: number;
    }[];
  };
}) {
  return (
    <Card
      data-testid="market-card"
      className={cn(
        "space-y-3 rounded-lg border px-4 py-3 shadow-sm",
        "animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out",
        "[@media(prefers-reduced-motion:reduce)]:animate-none"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading text-sm font-semibold md:text-base">
          {props.headline}
        </p>
        <span className="text-muted-foreground shrink-0 text-xs tracking-wide uppercase">
          {props.source === "fixture" ? "Sample" : "Live"}
        </span>
      </div>
      <ul className="space-y-2">
        {props.movers.map((m) => (
          <li
            key={m.symbol}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="min-w-0 truncate">
              <span className="font-medium">{m.symbol}</span>
              <span className="text-muted-foreground ml-1">{m.name}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
              <span>{formatPrice(m.price)}</span>
              <span
                className={cn(
                  m.change24h >= 0 ? "text-chart-2" : "text-destructive"
                )}
              >
                {m.change24h >= 0 ? "+" : ""}
                {m.change24h.toFixed(2)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export const { registry: marketCardRegistry } = defineRegistry(
  marketCardCatalog,
  {
    components: { MarketCard: MarketCardComponent },
  }
);
