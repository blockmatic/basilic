'use client'

import { useStateValue } from '@json-render/react'
import type { TrendingState } from '@/lib/genui/overview'

export function TrendingTable() {
  const trending = useStateValue<TrendingState>('/trending')
  const coins = trending?.coins ?? []

  if (!coins.length)
    return <p className="text-muted-foreground text-sm">No trending coins available.</p>

  return (
    <section data-testid="trending-table" className="space-y-2">
      <h2 className="font-heading text-base font-semibold md:text-lg">Trending</h2>
      <ul className="divide-y divide-border rounded-md border">
        {coins.map(coin => (
          <li key={coin.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate font-medium">{coin.name}</p>
              <p className="text-muted-foreground text-sm uppercase">{coin.symbol}</p>
            </div>
            {typeof coin.rank === 'number' ? (
              <span className="text-muted-foreground text-sm tabular-nums">#{coin.rank}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
