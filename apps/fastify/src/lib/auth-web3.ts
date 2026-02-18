import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../db/index.js'
import { users, walletIdentities, web3Nonce } from '../db/schema/index.js'

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

  if (expectedDomain && parsed.domain !== expectedDomain) {
    return { ok: false, code: 'INVALID_DOMAIN', message: 'Domain mismatch' }
  }

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

  if (!deletedNonce) {
    return { ok: false, code: 'INVALID_NONCE', message: 'Invalid or unknown nonce' }
  }

  if (deletedNonce.expiresAt < new Date()) {
    return { ok: false, code: 'EXPIRED_NONCE', message: 'Nonce has expired' }
  }

  const valid = await verifySignature({ message, signature, validatedAddress })
  if (!valid) {
    return { ok: false, code: 'INVALID_SIGNATURE', message: 'Invalid signature' }
  }

  const [wallet] = await db
    .select()
    .from(walletIdentities)
    .where(and(eq(walletIdentities.chain, chain), eq(walletIdentities.address, validatedAddress)))

  let user: typeof users.$inferSelect | undefined
  if (wallet) {
    const [u] = await db.select().from(users).where(eq(users.id, wallet.userId))
    user = u
  }

  if (!user) {
    const userId = randomUUID()
    await db.transaction(async tx => {
      await tx.insert(users).values({
        id: userId,
        email: null,
        emailVerified: false,
      })
      await tx.insert(walletIdentities).values({
        id: randomUUID(),
        userId,
        chain,
        address: validatedAddress,
        walletProvider: null,
      })
    })
    const [created] = await db.select().from(users).where(eq(users.id, userId))
    if (!created) throw new Error('Failed to create user')
    user = created
  } else if (wallet) {
    await db
      .update(walletIdentities)
      .set({ lastUsedAt: new Date() })
      .where(eq(walletIdentities.id, wallet.id))
  }

  return {
    ok: true,
    userId: user.id,
    validatedAddress,
    chain,
  }
}
