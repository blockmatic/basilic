/**
 * Parse SIWS (Sign-In with Solana) EIP-4361-style message.
 * Format matches SIWE but with "Solana account" instead of "Ethereum account".
 */
export function parseSiwsMessage(message: string): {
  domain: string
  address: string
  nonce: string
} | null {
  const lines = message.split('\n').map(l => l.trim())
  if (lines.length < 6) return null

  const firstLine = lines[0]
  const domainMatch = firstLine?.match(/^(.+)\s+wants you to sign in with your Solana account:\s*$/)
  if (!domainMatch) return null

  const address = lines[1]
  if (!address || address.length < 32) return null

  let nonce = ''
  for (const line of lines) {
    const nonceMatch = line.match(/^Nonce:\s*(.+)$/i)
    if (nonceMatch) {
      nonce = nonceMatch[1]?.trim() ?? ''
      break
    }
  }
  if (!nonce || nonce.length < 8) return null

  return {
    domain: domainMatch[1] ?? '',
    address,
    nonce,
  }
}
