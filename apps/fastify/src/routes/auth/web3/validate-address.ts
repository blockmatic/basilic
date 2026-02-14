import { PublicKey } from '@solana/web3.js'
import { getAddress } from 'viem'

const VALID_CHAINS = ['eip155', 'solana'] as const
export type Web3Chain = (typeof VALID_CHAINS)[number]

export function isValidChain(chain: string): chain is Web3Chain {
  return VALID_CHAINS.includes(chain as Web3Chain)
}

export function validateEip155Address(address: string): string {
  try {
    return getAddress(address)
  } catch {
    throw new Error('Invalid Ethereum address')
  }
}

export function validateSolanaAddress(address: string): string {
  try {
    const publicKey = new PublicKey(address)
    if (!PublicKey.isOnCurve(publicKey)) throw new Error('Invalid Solana address')
    return publicKey.toBase58()
  } catch {
    throw new Error('Invalid Solana address')
  }
}

export function validateAddress({ chain, address }: { chain: Web3Chain; address: string }): string {
  if (chain === 'eip155') return validateEip155Address(address)
  return validateSolanaAddress(address)
}
