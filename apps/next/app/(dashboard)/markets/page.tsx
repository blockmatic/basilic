import { getErrorMessage } from '@repo/error/nextjs'
import { getAuthStatus } from 'lib/auth/auth-utils'
import { redirect } from 'next/navigation'
import type { CoinMarket } from './markets-table'
import { MarketsTable } from './markets-table'

const coingeckoUrl =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'

async function fetchMarkets() {
  try {
    const res = await fetch(coingeckoUrl, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as CoinMarket[]
    return { coins: data ?? [], error: null }
  } catch (error) {
    return { coins: null, error: getErrorMessage(error) }
  }
}

export default async function MarketsPage() {
  const { authenticated } = await getAuthStatus()
  if (!authenticated) redirect('/auth/login')

  const { coins, error } = await fetchMarkets()

  return (
    <div className="w-full space-y-6">
      <MarketsTable coins={coins ?? undefined} error={error ?? undefined} />
    </div>
  )
}
