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

function formatChange24h(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function hasColumn({ columns, id }: { columns: string[]; id: ColumnId }) {
  return columns.includes(id)
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
      onClick={onToggle}
    >
      <Star className={watched ? 'fill-current' : undefined} />
    </Button>
  )
}

export function DataTable({ props }: { props: { columns: string[]; emptyLabel: string | null } }) {
  const coins = useStateValue<CoinMarket[]>('/coins') ?? []
  const error = useStateValue<string | null>('/error')
  const { watchedIds, isAtCap, pendingAssetId, onToggleWatch } = useBoardWatch()
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
  const showMarketCap = hasColumn({ columns, id: 'marketCap' })
  const showVolume = hasColumn({ columns, id: 'volume' })

  return (
    <div className="min-w-0 w-full max-w-full">
      <div className="space-y-2 xl:hidden">
        {coins.map(coin => {
          const watched = watchedIds.has(coin.id)
          const symbol = coin.symbol.toLowerCase()
          return (
            <div
              key={coin.id}
              data-testid="coin-row"
              data-symbol={symbol}
              className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors"
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
                    <p className="truncate font-heading font-medium">{coin.name}</p>
                    <p className="text-muted-foreground truncate text-xs uppercase">
                      {coin.symbol}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {showPrice ? (
                  <span className="font-heading text-base font-semibold tabular-nums">
                    {formatSpotPrice(coin.priceUsd)}
                  </span>
                ) : null}
                {showChange ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-heading text-xs font-semibold tabular-nums transition-colors',
                      coin.change24h >= 0
                        ? 'bg-chart-2/15 text-chart-2'
                        : 'bg-destructive/12 text-destructive',
                    )}
                  >
                    {formatChange24h(coin.change24h)}
                  </span>
                ) : null}
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
                <TableHead className="w-[6%] px-1">
                  <span className="sr-only">Watch</span>
                </TableHead>
              ) : null}
              {showRank ? (
                <TableHead className="hidden w-[4%] px-2 text-left lg:table-cell">#</TableHead>
              ) : null}
              {showIdentity ? <TableHead className="w-[36%]">Name</TableHead> : null}
              {showPrice ? <TableHead className="w-[16%] px-2 text-right">Price</TableHead> : null}
              {showChange ? <TableHead className="w-[8%] px-2 text-right">%</TableHead> : null}
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
              return (
                <TableRow key={coin.id} data-testid="coin-row" data-symbol={symbol}>
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
                          <span className="truncate font-medium">{coin.name}</span>
                          <span className="ml-1 shrink-0 text-muted-foreground text-sm uppercase">
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
                      {formatChange24h(coin.change24h)}
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
