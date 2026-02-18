export const REJECTION_PATTERNS = [
  /denied/i,
  /rejected/i,
  /cancel/i,
  /user denied/i,
  /user rejected/i,
]

export function isWalletRejection(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return REJECTION_PATTERNS.some(p => p.test(msg))
}

export function buildSiwsMessage({
  domain,
  address,
  nonce,
  statement,
  uri = 'https://localhost',
  chainId = 'mainnet-beta',
}: {
  domain: string
  address: string
  nonce: string
  statement: string
  uri?: string
  chainId?: string
}) {
  return `${domain} wants you to sign in with your Solana account:\n${address}\n\n${statement}\n\nURI: ${uri}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
}
