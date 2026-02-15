/** Short display format for wallet address (chain:first8chars…) */
export function formatWalletShort({ chain, address }: { chain: string; address: string }): string {
  return `${chain}:${address.slice(0, 8)}…`
}
