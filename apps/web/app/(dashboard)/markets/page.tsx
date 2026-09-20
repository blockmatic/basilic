import { boardNotice, fetchMarkets } from './fetch-markets'
import { MarketsTable } from './markets-table'

export default async function MarketsPage() {
  const { coins, sync, error } = await fetchMarkets()
  const notice = boardNotice(sync)

  return (
    <div className="w-full space-y-4">
      {notice ? <p className="text-muted-foreground text-sm">{notice}</p> : null}
      <MarketsTable coins={coins} error={error ?? undefined} />
    </div>
  )
}
