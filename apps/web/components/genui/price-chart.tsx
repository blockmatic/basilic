'use client'

import { useStateValue } from '@json-render/react'
import { Button } from '@repo/ui/components/button'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/ui/components/chart'
import { useQueryStates } from 'nuqs'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts'
import { boardViewParsers, defaultCandlePeriod, periodValues } from '@/lib/genui'
import { honestyBySurface } from '@/lib/genui/candidates'
import type { SeriesState } from '@/lib/genui/series'

const chartConfig = {
  close: { label: 'Close', color: 'var(--chart-1)' },
} satisfies ChartConfig

function chartRows({ series, scale }: { series: SeriesState; scale: 'price' | 'normalized' }) {
  const first = series.candles[0]?.close
  return series.candles.map(candle => ({
    time: new Date(candle.openTime).toISOString(),
    close:
      scale === 'normalized' && first
        ? Number(((candle.close / first) * 100).toFixed(2))
        : candle.close,
  }))
}

function PeriodPicker() {
  const [view, setView] = useQueryStates(boardViewParsers, { history: 'push', shallow: true })
  const selected = view.period ?? defaultCandlePeriod
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Chart period">
      {periodValues.map(value => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={selected === value ? 'secondary' : 'ghost'}
          className="h-8 min-w-11 px-2"
          aria-pressed={selected === value}
          onClick={() => void setView({ period: value })}
        >
          {value}
        </Button>
      ))}
    </div>
  )
}

function PriceSeries({
  kind,
  scale,
}: {
  kind: 'line' | 'area' | 'bar'
  scale: 'price' | 'normalized'
}) {
  const series = useStateValue<SeriesState>('/series')
  const rows = series ? chartRows({ series, scale }) : []
  const empty = !series || series.source === 'fixture' || !rows.length
  return (
    <div className="space-y-2">
      <PeriodPicker />
      {empty ? (
        <p className="text-muted-foreground text-sm">
          {honestyBySurface.chart ?? 'No Binance market for this asset. Showing the table.'}
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="aspect-video min-h-40 w-full">
          {kind === 'area' ? (
            <AreaChart data={rows}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="close"
                type="monotone"
                fill="var(--color-close)"
                stroke="var(--color-close)"
              />
            </AreaChart>
          ) : kind === 'bar' ? (
            <BarChart data={rows}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="close" fill="var(--color-close)" />
            </BarChart>
          ) : (
            <LineChart data={rows}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="close"
                type="monotone"
                stroke="var(--color-close)"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          )}
        </ChartContainer>
      )}
    </div>
  )
}

export function LineChartComponent({ props }: { props: { scale: 'price' | 'normalized' | null } }) {
  return <PriceSeries kind="line" scale={props.scale ?? 'price'} />
}

export function AreaChartComponent() {
  return <PriceSeries kind="area" scale="price" />
}

export function BarChartComponent() {
  return <PriceSeries kind="bar" scale="price" />
}
