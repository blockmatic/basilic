'use client'

import { defineCatalog } from '@json-render/core'
import { defineRegistry, schema } from '@json-render/react'
import { Card } from '@repo/ui/components/card'
import { cn } from '@repo/ui/lib/utils'
import { z } from 'zod'

const moverSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change24h: z.number(),
})

export const marketCardCatalog = defineCatalog(schema, {
  components: {
    MarketCard: {
      props: z.object({
        headline: z.string(),
        source: z.enum(['live', 'mock']),
        movers: z.array(moverSchema),
      }),
      description: 'Market movers card with prices and 24h change',
    },
  },
  actions: {},
})

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 0.01 ? 6 : 2,
  }).format(n)
}

function MarketCardComponent({
  props,
}: {
  props: {
    headline: string
    source: 'live' | 'mock'
    movers: Array<{ symbol: string; name: string; price: number; change24h: number }>
  }
}) {
  return (
    <Card
      data-testid="market-card"
      className={cn(
        'space-y-3 rounded-lg border py-3 px-4 shadow-sm',
        'animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out',
        '[@media(prefers-reduced-motion:reduce)]:animate-none',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading font-semibold text-sm md:text-base">{props.headline}</p>
        <span className="text-muted-foreground shrink-0 text-xs uppercase tracking-wide">
          {props.source === 'mock' ? 'Sample' : 'Live'}
        </span>
      </div>
      <ul className="space-y-2">
        {props.movers.map(m => (
          <li key={m.symbol} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              <span className="font-medium">{m.symbol}</span>
              <span className="text-muted-foreground ml-1">{m.name}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
              <span>{formatPrice(m.price)}</span>
              <span className={cn(m.change24h >= 0 ? 'text-chart-2' : 'text-destructive')}>
                {m.change24h >= 0 ? '+' : ''}
                {m.change24h.toFixed(2)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export const { registry: marketCardRegistry } = defineRegistry(marketCardCatalog, {
  components: { MarketCard: MarketCardComponent },
})
