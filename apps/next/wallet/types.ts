/** SIWE/SIWS chain identifier */
export type Web3Chain = 'eip155' | 'solana'

/** Wallet adapter – supplied via WalletProvider (wagmi/Solana adapters) */
export interface WalletAdapter {
  chain: Web3Chain
  address: string | undefined
  signMessage: (message: string | Uint8Array) => Promise<{ signature: string }>
}
