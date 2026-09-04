import { fetchMarkets } from './fetch-markets'
import { MarketsTable } from './markets-table'

export default async function MarketsPage() {
  const { coins, source } = await fetchMarkets()

  return (
    <div className="w-full space-y-4">
      {source === 'mock' ? (
        <p className="text-muted-foreground text-sm">
          Showing a sample board. CoinGecko was unavailable or rate-limited.
        </p>
      ) : null}
      <MarketsTable coins={coins} />
    </div>
  )
}
