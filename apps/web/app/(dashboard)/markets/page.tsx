import { fetchMarkets, isSampleBoard } from './fetch-markets'
import { MarketsTable } from './markets-table'

export default async function MarketsPage() {
  const { coins, sync, error } = await fetchMarkets()

  return (
    <div className="w-full space-y-4">
      {isSampleBoard(sync) ? (
        <p className="text-muted-foreground text-sm">Showing a sample board.</p>
      ) : null}
      <MarketsTable coins={coins} error={error ?? undefined} />
    </div>
  )
}
