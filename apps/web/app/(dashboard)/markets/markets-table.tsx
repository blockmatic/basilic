import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import { cn } from '@repo/ui/lib/utils'
import Image from 'next/image'

export type CoinMarket = {
  id: string
  symbol: string
  name: string
  imageUrl: string | null
  priceUsd: number
  change24h: number
  volumeUsd: number
  marketCapUsd: number
  rank: number
  fetchedAt: string
}

type MarketsTableProps = {
  coins?: CoinMarket[]
  error?: string
}

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

function formatChange24h(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function Change24hBadge({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-heading text-xs font-semibold tabular-nums transition-colors',
        isPositive ? 'bg-chart-2/15 text-chart-2' : 'bg-destructive/12 text-destructive',
      )}
    >
      {formatChange24h(value)}
    </span>
  )
}

export function MarketsTable({ coins, error }: MarketsTableProps) {
  if (error)
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  if (!coins?.length)
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-muted-foreground text-sm">No market data available.</p>
      </div>
    )

  return (
    <div className="min-w-0 w-full max-w-full">
      {/* Mobile/Tablet/Mid-size: card layout (touch-friendly, avoids truncation when assistant open) */}
      <div className="space-y-2 xl:hidden">
        {coins.map(c => (
          <div
            key={c.id}
            className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {c.imageUrl && (
                <Image
                  src={c.imageUrl}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 shrink-0 rounded-full"
                />
              )}
              <div className="min-w-0">
                <p className="truncate font-heading font-medium">{c.name}</p>
                <p className="text-muted-foreground truncate text-xs uppercase">{c.symbol}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-heading text-base font-semibold tabular-nums">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: c.priceUsd < 0.01 ? 6 : 2,
                }).format(c.priceUsd)}
              </span>
              <Change24hBadge value={c.change24h} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop (xl+): fluid table — fits container, never overflows */}
      <div className="hidden w-full min-w-0 overflow-hidden xl:block [&_[data-slot=table-container]]:overflow-hidden">
        <Table className="table-fixed w-full" fluid>
          <colgroup>
            <col style={{ width: '4%' }} />
            <col style={{ width: '40%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[4%] px-2 text-left lg:table-cell">#</TableHead>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead className="w-[18%] px-2 text-right">Price</TableHead>
              <TableHead className="w-[8%] px-2 text-right">%</TableHead>
              <TableHead className="hidden w-[10%] px-2 text-right md:table-cell">
                Market cap
              </TableHead>
              <TableHead className="hidden w-[10%] px-2 text-right md:table-cell">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coins.map(c => (
              <TableRow key={c.id}>
                <TableCell className="text-muted-foreground hidden font-medium text-left lg:table-cell">
                  {c.rank}
                </TableCell>
                <TableCell className="min-w-0 text-left">
                  <div className="flex min-w-0 items-center gap-2">
                    {c.imageUrl && (
                      <Image
                        src={c.imageUrl}
                        alt=""
                        width={24}
                        height={24}
                        className="size-6 shrink-0 rounded-full"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="ml-1 shrink-0 text-muted-foreground text-sm uppercase">
                        {c.symbol}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="numeric min-w-0 truncate px-2 text-right font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: c.priceUsd < 0.01 ? 6 : 2,
                  }).format(c.priceUsd)}
                </TableCell>
                <TableCell
                  className={cn(
                    'numeric min-w-0 px-2 text-right',
                    c.change24h >= 0 ? 'text-chart-2' : 'text-destructive',
                  )}
                >
                  {formatChange24h(c.change24h)}
                </TableCell>
                <TableCell className="numeric hidden truncate px-2 text-right text-muted-foreground md:table-cell">
                  {formatPrice(c.marketCapUsd)}
                </TableCell>
                <TableCell className="numeric hidden truncate px-2 text-right text-muted-foreground md:table-cell">
                  {formatPrice(c.volumeUsd)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
