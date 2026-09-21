import { type SearchQueryState, toCoinsQuery } from './coins/search-query'

/** Query keys matching @repo/react auth hooks (useUser, useSession). Used for invalidation only. */
export const authSessionUserQueryKey = ['auth', 'session', 'user'] as const
export const authSessionJwtQueryKey = ['auth', 'session', 'jwt'] as const

export const coinsListQueryKeyPrefix = ['coins', 'list'] as const
export const coinsListQueryKey = (query: SearchQueryState) =>
  [...coinsListQueryKeyPrefix, toCoinsQuery({ query })] as const
export const coinWatchesQueryKey = ['coins', 'watches'] as const
export const coinsCandlesQueryKey = ({ assetId, period }: { assetId: string; period: string }) =>
  ['coins', 'candles', assetId, period] as const
export const accountWalletQueryKey = ['account', 'wallet'] as const
export const eveHostQueryKey = (id: 'chat' | 'command') => ['eve', 'host', id] as const
