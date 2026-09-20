import { getErrorMessage } from '@repo/error'
import { getServerAuthToken } from '@/lib/auth/auth-server'
import { createBffClient } from '@/lib/auth/bff-client'
import type { CoinMarket } from './markets-table'

export type MarketsSync = {
  source: string
  fetchedAt: string | null
  lastError: string | null
}

const emptySync: MarketsSync = { source: 'fixture', fetchedAt: null, lastError: null }

function asNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

export function isSampleBoard({ source, fetchedAt }: MarketsSync) {
  return source === 'fixture' || fetchedAt == null
}

export async function fetchMarkets(): Promise<{
  coins: CoinMarket[]
  sync: MarketsSync
  error: string | null
}> {
  const { token } = await getServerAuthToken()
  if (!token) return { coins: [], sync: emptySync, error: 'Authentication required' }

  const { client } = createBffClient({ token })
  try {
    const data = await client.listCoins()
    return {
      coins: data.coins.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        imageUrl: asNullableString(coin.imageUrl),
        priceUsd: coin.priceUsd,
        change24h: coin.change24h,
        volumeUsd: coin.volumeUsd,
        marketCapUsd: coin.marketCapUsd,
        rank: coin.rank,
        fetchedAt: coin.fetchedAt,
      })),
      sync: {
        source: data.sync.source,
        fetchedAt: asNullableString(data.sync.fetchedAt),
        lastError: asNullableString(data.sync.lastError),
      },
      error: null,
    }
  } catch (error) {
    return { coins: [], sync: emptySync, error: getErrorMessage(error) }
  }
}
