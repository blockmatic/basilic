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

export const marketsMock: CoinMarket[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 67_420.12,
    price_change_percentage_24h: 2.14,
    market_cap_rank: 1,
    market_cap: 1_320_000_000_000,
    total_volume: 28_000_000_000,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3_412.5,
    price_change_percentage_24h: -1.08,
    market_cap_rank: 2,
    market_cap: 410_000_000_000,
    total_volume: 14_000_000_000,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 178.4,
    price_change_percentage_24h: 4.62,
    market_cap_rank: 5,
    market_cap: 82_000_000_000,
    total_volume: 3_200_000_000,
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    current_price: 0.62,
    price_change_percentage_24h: 0.41,
    market_cap_rank: 4,
    market_cap: 35_000_000_000,
    total_volume: 1_100_000_000,
  },
]
