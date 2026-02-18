import type { Web3Chain } from '@/wallet/types'

export const WALLET_ROW_CONFIG: { chain: Web3Chain; label: string; connectLabel: string }[] = [
  { chain: 'eip155', label: 'Sign in with Ethereum', connectLabel: 'Connect EVM wallet' },
  { chain: 'solana', label: 'Sign in with Solana', connectLabel: 'Connect Solana' },
]
