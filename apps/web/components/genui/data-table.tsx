'use client'

import { useStateValue } from '@json-render/react'
import { Button } from '@repo/ui/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import { cn } from '@repo/ui/lib/utils'
import { Star } from 'lucide-react'
import Image from 'next/image'
import type { KeyboardEvent } from 'react'
import type { CoinMarket } from '@/lib/coins/board'
import type { ColumnId } from '@/lib/genui'
import { useBoardWatch } from './board-watch'

function formatPrice(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

function formatSpotPrice(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 0.01 ? 6 : 2,
  }).format(n)
}

function formatChange(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function hasColumn({ columns, id }: { columns: string[]; id: ColumnId }) {
  return columns.includes(id)
}

function Spark7d({ prices, up }: { prices: number[]; up: boolean }) {
  if (prices.length < 2) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const width = 72
  const height = 28
  const d = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * width
      const y = height - ((price - min) / span) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0', up ? 'text-chart-2' : 'text-destructive')}
      aria-hidden="true"
      data-testid="coin-spark-7d"
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function Spark7dCell({ coin }: { coin: CoinMarket }) {
  if (!coin.sparkline7d.length && coin.change7d == null) return null
  const up = (coin.change7d ?? 0) >= 0
  return (
    <div className="flex items-center justify-end gap-2">
      <Spark7d prices={coin.sparkline7d} up={up} />
      {coin.change7d != null ? (
        <span
          className={cn(
            'text-xs font-medium tabular-nums',
            up ? 'text-chart-2' : 'text-destructive',
          )}
        >
          {formatChange(coin.change7d)}
        </span>
      ) : null}
    </div>
  )
}

function CoinWatchButton({
  name,
  watched,
  disabled,
  pending,
  onToggle,
}: {
  name: string
  watched: boolean
  disabled: boolean
  pending: boolean
  onToggle: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-11 shrink-0 sm:size-9"
      aria-label={watched ? `Unwatch ${name}` : `Watch ${name}`}
      aria-pressed={watched}
      data-testid="coin-watch"
      disabled={disabled || pending}
      onClick={event => {
        event.stopPropagation()
        onToggle()
      }}
    >
      <Star aria-hidden="true" className={watched ? 'fill-current' : undefined} />
    </Button>
  )
}

export function DataTable({ props }: { props: { columns: string[]; emptyLabel: string | null } }) {
  const coins = useStateValue<CoinMarket[]>('/coins') ?? []
  const error = useStateValue<string | null>('/error')
  const { watchedIds, isAtCap, pendingAssetId, focusedAssetId, onToggleWatch, onOpenChart } =
    useBoardWatch()
  const columns = props.columns

  if (error)
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  if (!coins.length) {
    if (!props.emptyLabel) return null
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-muted-foreground text-sm">{props.emptyLabel}</p>
      </div>
    )
  }

  const showWatch = hasColumn({ columns, id: 'watch' })
  const showRank = hasColumn({ columns, id: 'rank' })
  const showIdentity = hasColumn({ columns, id: 'identity' })
  const showPrice = hasColumn({ columns, id: 'price' })
  const showChange = hasColumn({ columns, id: 'change24h' })
  const showSpark = hasColumn({ columns, id: 'spark7d' })
  const showMarketCap = hasColumn({ columns, id: 'marketCap' })
  const showVolume = hasColumn({ columns, id: 'volume' })

  function openChart({ assetId }: { assetId: string }) {
    onOpenChart({ assetId })
  }

  function onRowKeyDown(event: KeyboardEvent<HTMLElement>, assetId: string) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    openChart({ assetId })
  }

  return (
    <div className="min-w-0 w-full max-w-full">
      <div className="space-y-2 xl:hidden">
        {coins.map(coin => {
          const watched = watchedIds.has(coin.id)
          const symbol = coin.symbol.toLowerCase()
          const focused = focusedAssetId === coin.id
          return (
            <div
              key={coin.id}
              data-testid="coin-row"
              data-symbol={symbol}
              data-focused={focused ? 'true' : undefined}
              role="button"
              tabIndex={0}
              aria-current={focused ? 'true' : undefined}
              className={cn(
                'flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors',
                focused && 'ring-2 ring-primary/40',
              )}
              onClick={() => openChart({ assetId: coin.id })}
              onKeyDown={event => onRowKeyDown(event, coin.id)}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {showWatch ? (
                  <CoinWatchButton
                    name={coin.name}
                    watched={watched}
                    disabled={isAtCap && !watched}
                    pending={pendingAssetId === coin.id}
                    onToggle={() => onToggleWatch({ assetId: coin.id, watched })}
                  />
                ) : null}
                {showIdentity && coin.imageUrl ? (
                  <Image
                    src={coin.imageUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 shrink-0 rounded-full"
                  />
                ) : null}
                {showIdentity ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{coin.name}</p>
                    <p className="text-muted-foreground truncate text-xs uppercase">
                      {coin.symbol}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {showPrice ? (
                  <span className="text-sm font-medium tabular-nums">
                    {formatSpotPrice(coin.priceUsd)}
                  </span>
                ) : null}
                {showChange ? (
                  <span
                    className={cn(
                      'text-xs font-medium tabular-nums',
                      coin.change24h >= 0 ? 'text-chart-2' : 'text-destructive',
                    )}
                  >
                    {formatChange(coin.change24h)}
                  </span>
                ) : null}
                {showSpark ? <Spark7dCell coin={coin} /> : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="hidden w-full min-w-0 overflow-hidden xl:block [&_[data-slot=table-container]]:overflow-hidden">
        <Table className="table-fixed w-full" fluid>
          <TableHeader>
            <TableRow>
              {showWatch ? (
                <TableHead className="w-[5%] px-1">
                  <span className="sr-only">Watch</span>
                </TableHead>
              ) : null}
              {showRank ? (
                <TableHead className="hidden w-[4%] px-2 text-left lg:table-cell">#</TableHead>
              ) : null}
              {showIdentity ? <TableHead className="w-[28%]">Name</TableHead> : null}
              {showPrice ? <TableHead className="w-[12%] px-2 text-right">Price</TableHead> : null}
              {showChange ? <TableHead className="w-[7%] px-2 text-right">24h</TableHead> : null}
              {showSpark ? <TableHead className="w-[14%] px-2 text-right">7d</TableHead> : null}
              {showMarketCap ? (
                <TableHead className="hidden w-[15%] px-2 text-right md:table-cell">
                  Market cap
                </TableHead>
              ) : null}
              {showVolume ? (
                <TableHead className="hidden w-[15%] px-2 text-right md:table-cell">
                  Volume
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {coins.map(coin => {
              const watched = watchedIds.has(coin.id)
              const symbol = coin.symbol.toLowerCase()
              const focused = focusedAssetId === coin.id
              return (
                <TableRow
                  key={coin.id}
                  data-testid="coin-row"
                  data-symbol={symbol}
                  data-focused={focused ? 'true' : undefined}
                  tabIndex={0}
                  aria-current={focused ? 'true' : undefined}
                  className={cn('cursor-pointer', focused && 'bg-muted/40')}
                  onClick={() => openChart({ assetId: coin.id })}
                  onKeyDown={event => onRowKeyDown(event, coin.id)}
                >
                  {showWatch ? (
                    <TableCell className="px-1">
                      <CoinWatchButton
                        name={coin.name}
                        watched={watched}
                        disabled={isAtCap && !watched}
                        pending={pendingAssetId === coin.id}
                        onToggle={() => onToggleWatch({ assetId: coin.id, watched })}
                      />
                    </TableCell>
                  ) : null}
                  {showRank ? (
                    <TableCell className="text-muted-foreground hidden font-medium text-left lg:table-cell">
                      {coin.rank}
                    </TableCell>
                  ) : null}
                  {showIdentity ? (
                    <TableCell className="min-w-0 text-left">
                      <div className="flex min-w-0 items-center gap-2">
                        {coin.imageUrl ? (
                          <Image
                            src={coin.imageUrl}
                            alt=""
                            width={24}
                            height={24}
                            className="size-6 shrink-0 rounded-full"
                          />
                        ) : null}
                        <div className="min-w-0">
                          <span className="truncate text-sm font-medium">{coin.name}</span>
                          <span className="ml-1 shrink-0 text-muted-foreground text-xs uppercase">
                            {coin.symbol}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  ) : null}
                  {showPrice ? (
                    <TableCell className="numeric min-w-0 truncate px-2 text-right font-medium tabular-nums">
                      {formatSpotPrice(coin.priceUsd)}
                    </TableCell>
                  ) : null}
                  {showChange ? (
                    <TableCell
                      className={cn(
                        'numeric min-w-0 px-2 text-right tabular-nums',
                        coin.change24h >= 0 ? 'text-chart-2' : 'text-destructive',
                      )}
                    >
                      {formatChange(coin.change24h)}
                    </TableCell>
                  ) : null}
                  {showSpark ? (
                    <TableCell className="min-w-0 px-2 text-right">
                      <Spark7dCell coin={coin} />
                    </TableCell>
                  ) : null}
                  {showMarketCap ? (
                    <TableCell className="numeric hidden truncate px-2 text-right text-muted-foreground md:table-cell tabular-nums">
                      {formatPrice(coin.marketCapUsd)}
                    </TableCell>
                  ) : null}
                  {showVolume ? (
                    <TableCell className="numeric hidden truncate px-2 text-right text-muted-foreground md:table-cell tabular-nums">
                      {formatPrice(coin.volumeUsd)}
                    </TableCell>
                  ) : null}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
