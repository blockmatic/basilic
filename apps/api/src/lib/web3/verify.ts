import { walletIdentities } from '@repo/db/schema'
import bs58 from 'bs58'
import { sql } from 'drizzle-orm'
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
export function parseSignInMessage(
  message: string,
): { address: string; nonce: string; domain: string } | null {
  const headerMatch = message.match(
    /^(\S+) wants you to sign in with your (?:Ethereum|Solana) account:\s*\n([^\s\n]+)/i,
  )
  const nonceMatch = message.match(/Nonce:\s*(\S+)/i)
  if (!headerMatch?.[1] || !headerMatch[2] || !nonceMatch?.[1]) return null
  return {
    domain: headerMatch[1].trim(),
    address: headerMatch[2].trim(),
    nonce: nonceMatch[1].trim(),
  }
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

export function walletIdentityAddressEquals({ address }: { address: string }) {
  return sql`lower(${walletIdentities.address}) = ${address.toLowerCase()}`
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
      return getAddress(address)
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
