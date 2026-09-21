import { getDb } from '@repo/db'
import { users, walletIdentities, web3Nonce } from '@repo/db/schema'
import { and, eq } from 'drizzle-orm'
import { walletIdentityAddressEquals } from './verify.js'

type ParsedMessage = { address: string; nonce: string; domain: string }

type Web3VerifyResult =
  | { ok: true; userId: string; validatedAddress: string; chain: 'eip155' | 'solana' }
  | { ok: false; code: string; message: string }

export async function verifyWeb3Auth({
  chain,
  message,
  signature,
  expectedDomain,
  parseMessage,
  validateAddress,
  verifySignature,
}: {
  chain: 'eip155' | 'solana'
  message: string
  signature: string
  expectedDomain?: string
  parseMessage: (msg: string) => ParsedMessage | null
  validateAddress: (addr: string) => string
  verifySignature: (params: {
    message: string
    signature: string
    validatedAddress: string
  }) => Promise<boolean>
}): Promise<Web3VerifyResult> {
  const parsed = parseMessage(message)
  if (!parsed) return { ok: false, code: 'INVALID_MESSAGE', message: 'Invalid message format' }

  if (expectedDomain && parsed.domain !== expectedDomain)
    return { ok: false, code: 'INVALID_DOMAIN', message: 'Domain mismatch' }

  let validatedAddress: string
  try {
    validatedAddress = validateAddress(parsed.address)
  } catch {
    return {
      ok: false,
      code: 'INVALID_ADDRESS',
      message: chain === 'eip155' ? 'Invalid Ethereum address' : 'Invalid Solana address',
    }
  }

  const db = await getDb()
  const [deletedNonce] = await db
    .delete(web3Nonce)
    .where(
      and(
        eq(web3Nonce.chain, chain),
        eq(web3Nonce.address, validatedAddress),
        eq(web3Nonce.nonce, parsed.nonce),
      ),
    )
    .returning()

  if (!deletedNonce)
    return { ok: false, code: 'INVALID_NONCE', message: 'Invalid or unknown nonce' }

  if (deletedNonce.expiresAt < new Date())
    return { ok: false, code: 'EXPIRED_NONCE', message: 'Nonce has expired' }

  const valid = await verifySignature({ message, signature, validatedAddress })
  if (!valid) return { ok: false, code: 'INVALID_SIGNATURE', message: 'Invalid signature' }

  const wallets = await db
    .select()
    .from(walletIdentities)
    .where(
      and(
        eq(walletIdentities.chain, chain),
        walletIdentityAddressEquals({ address: validatedAddress }),
      ),
    )
  const wallet = wallets.find(row => row.address === validatedAddress) ?? wallets[0]

  if (!wallet)
    return {
      ok: false,
      code: 'WALLET_NOT_LINKED',
      message:
        'This wallet is not linked to an account. Sign in with email or another method first, then link a wallet in Settings.',
    }

  const [user] = await db.select().from(users).where(eq(users.id, wallet.userId))
  if (!user)
    return {
      ok: false,
      code: 'WALLET_NOT_LINKED',
      message:
        'This wallet is not linked to an account. Sign in with email or another method first, then link a wallet in Settings.',
    }

  await db
    .update(walletIdentities)
    .set({ lastUsedAt: new Date() })
    .where(eq(walletIdentities.id, wallet.id))

  return {
    ok: true,
    userId: user.id,
    validatedAddress,
    chain,
  }
}
