import bs58 from 'bs58'
import nacl from 'tweetnacl'
import type { Hex } from 'viem'
import { getAddress, verifyMessage } from 'viem'

const eip155Chain = 'eip155'
const solanaChain = 'solana'

export type Web3Chain = typeof eip155Chain | typeof solanaChain

export async function verifyWalletSignature({
  chain,
  message,
  signature,
  address,
}: {
  chain: Web3Chain
  message: string
  signature: string
  address: string
}): Promise<{ valid: boolean; normalizedAddress: string }> {
  const normalized = normalizeAddress({ chain, address })
  if (!normalized) return { valid: false, normalizedAddress: '' }

  if (chain === eip155Chain)
    try {
      const valid = await verifyMessage({
        address: normalized as `0x${string}`,
        message,
        signature: signature as Hex,
      })
      return { valid, normalizedAddress: normalized }
    } catch {
      return { valid: false, normalizedAddress: '' }
    }

  if (chain === solanaChain)
    try {
      const msgBytes = new TextEncoder().encode(message)
      const sigBytes = bs58.decode(signature)
      const pubkeyBytes = bs58.decode(normalized)
      const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubkeyBytes)
      return { valid, normalizedAddress: normalized }
    } catch {
      return { valid: false, normalizedAddress: '' }
    }

  return { valid: false, normalizedAddress: '' }
}

// Parse SIWE/SIWS message to extract address and nonce
export function parseSignInMessage(message: string): { address: string; nonce: string } | null {
  // SIWE format: "domain wants you to sign in with your Ethereum account:\n{address}\n..."
  // SIWS format: "domain wants you to sign in with your Solana account:\n{address}\n..."
  const addrMatch = message.match(
    /wants you to sign in with your (?:Ethereum|Solana) account:\s*\n([^\s\n]+)/i,
  )
  const nonceMatch = message.match(/Nonce:\s*(\S+)/i)
  if (!addrMatch?.[1] || !nonceMatch?.[1]) return null
  return { address: addrMatch[1].trim(), nonce: nonceMatch[1].trim() }
}

export function getCanonicalAddress({
  chain,
  address,
}: {
  chain: Web3Chain
  address: string
}): string | null {
  return normalizeAddress({ chain, address })
}

function normalizeAddress({
  chain,
  address,
}: {
  chain: Web3Chain
  address: string
}): string | null {
  if (chain === eip155Chain)
    try {
      return getAddress(address).toLowerCase()
    } catch {
      return null
    }

  if (chain === solanaChain)
    try {
      const decoded = bs58.decode(address)
      if (decoded.length !== 32) return null
      return bs58.encode(decoded) // Re-encode to normalize
    } catch {
      return null
    }

  return null
}
