'use client'

import { useStateValue } from '@json-render/react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
import type { GlobalState } from '@/lib/genui/overview'

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)
}

export function MetricTile({
  props,
}: {
  props: { field: 'btcDominance' | 'marketCapUsd' | 'volumeUsd'; label: string }
}) {
  const global = useStateValue<GlobalState>('/global')
  const raw = global?.[props.field] ?? 0
  const value = props.field === 'btcDominance' ? `${raw.toFixed(1)}%` : formatUsd(raw)

  return (
    <Card data-testid="metric-tile" data-field={props.field}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{props.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}
