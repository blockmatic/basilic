import { getErrorMessage } from '@repo/error'
import type { CoinMarket } from './markets-table'
import { marketsMock } from './mock-snapshot'

const coingeckoUrl =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'

export async function fetchMarkets() {
  try {
    const res = await fetch(coingeckoUrl, { next: { revalidate: 60 } })
    if (!res.ok) return { coins: marketsMock, source: 'mock' as const, error: null }
    const data = (await res.json()) as CoinMarket[]
    if (!data?.length) return { coins: marketsMock, source: 'mock' as const, error: null }
    return { coins: data, source: 'live' as const, error: null }
  } catch (error) {
    return { coins: marketsMock, source: 'mock' as const, error: getErrorMessage(error) }
  }
}
