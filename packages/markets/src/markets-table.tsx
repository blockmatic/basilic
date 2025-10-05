import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import type { MarketData } from './markets-tracker'

export async function MarketsTable({
  marketData = [],
}: {
  marketData: MarketData[]
}) {
  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`
    }
    return num.toLocaleString()
  }

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  const getPercentageColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500'
  }

  if (marketData.length === 0) {
    return <div className="p-4 text-center">No market data available.</div>
  }

  return (
    <div className="p-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">1h %</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">7d %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume(24h)</TableHead>
              <TableHead className="text-right">Circulating Supply</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketData.map((crypto) => (
              <TableRow key={crypto.symbol}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{crypto.name}</span>
                    <span className="text-muted-foreground">
                      {crypto.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  ${crypto.price.toFixed(2)}
                </TableCell>
                <TableCell
                  className={`text-right ${getPercentageColor(crypto.change1h)}`}
                >
                  {formatPercentage(crypto.change1h)}
                </TableCell>
                <TableCell
                  className={`text-right ${getPercentageColor(crypto.change24h)}`}
                >
                  {formatPercentage(crypto.change24h)}
                </TableCell>
                <TableCell
                  className={`text-right ${getPercentageColor(crypto.change7d)}`}
                >
                  {formatPercentage(crypto.change7d)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(crypto.marketCap)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span>{formatNumber(crypto.volume24h)}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(crypto.volume24h / crypto.price)}{' '}
                      {crypto.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>
                      {formatNumber(crypto.circulatingSupply)} {crypto.symbol}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
