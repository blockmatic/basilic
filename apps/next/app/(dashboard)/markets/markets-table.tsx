import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'

export type CoinMarket = {
  id?: string
  symbol?: string
  name?: string
  image?: string
  current_price?: number
  market_cap?: number
  market_cap_rank?: number
  price_change_percentage_24h?: number | null
  total_volume?: number
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
    <div className="mx-auto max-w-4xl overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h %</TableHead>
            <TableHead className="text-right">Market cap</TableHead>
            <TableHead className="text-right">Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coins.map((c, i) => (
            <TableRow key={c.id ?? i}>
              <TableCell className="text-muted-foreground font-medium">
                {c.market_cap_rank ?? i + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {c.image && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.image} alt="" className="size-6 rounded-full" />
                    </>
                  )}
                  <div>
                    <span className="font-medium">{c.name ?? 'Unknown'}</span>
                    <span className="ml-1 text-muted-foreground text-sm uppercase">
                      {c.symbol ?? ''}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {c.current_price != null
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: c.current_price < 0.01 ? 6 : 2,
                    }).format(c.current_price)
                  : '—'}
              </TableCell>
              <TableCell
                className={`text-right ${
                  (c.price_change_percentage_24h ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {c.price_change_percentage_24h != null
                  ? `${c.price_change_percentage_24h >= 0 ? '+' : ''}${c.price_change_percentage_24h.toFixed(2)}%`
                  : '—'}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {c.market_cap != null ? formatPrice(c.market_cap) : '—'}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {c.total_volume != null ? formatPrice(c.total_volume) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
