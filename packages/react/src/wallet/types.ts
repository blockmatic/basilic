/** SIWE/SIWS chain identifier */
export type Web3Chain = 'eip155' | 'solana'

/** EVM transaction params (viem SendTransactionParameters) */
export type EvmTxParams = {
  to: `0x${string}`
  value?: bigint
  data?: `0x${string}`
  gas?: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
  [key: string]: unknown
}

/** Solana transaction params */
export type SolanaTxParams = {
  /** Serialized transaction as base58 or hex */
  serializedTransaction: string
  /** Optional signers if partial signing needed */
  signers?: unknown[]
  [key: string]: unknown
}

/** Unified transfer params – adapter resolves to EvmTxParams or SolanaTxParams */
export type TransferParams = {
  to: string
  value: bigint | string
  data?: string
  [key: string]: unknown
}

/** Wallet adapter – apps supply via WalletProvider (wagmi/Solana adapters) */
export interface WalletAdapter {
  chain: Web3Chain
  address: string | undefined
  signMessage: (message: string | Uint8Array) => Promise<{ signature: string }>
  sendTransaction?: (params: EvmTxParams | SolanaTxParams) => Promise<{ hash: string }>
}
