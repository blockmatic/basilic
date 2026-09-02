import { and, eq, sql } from 'drizzle-orm'
import type { getDb } from '../../db/index.js'
import { account, passkeyCredentials, users, walletIdentities } from '../../db/schema/index.js'

type Db = Awaited<ReturnType<typeof getDb>>
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]
type DbOrTx = Db | Tx

/** Serialize sign-in-method mutations per user (check + delete in one transaction). */
export async function withUserSignInMethodLock<T>(
  db: Db,
  userId: string,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.transaction(async tx => {
    await tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).for('update')
    return fn(tx)
  })
}

/**
 * Returns true if the user has at least one remaining sign-in method.
 * Sign-in methods: users.email, account (OAuth), wallet_identities, passkey_credentials.
 *
 * When checking before OAuth unlink, pass excludeProviderId to simulate removal of that account.
 */
export async function hasRemainingLoginMethod(
  db: DbOrTx,
  userId: string,
  options?: { excludeProviderId?: string; excludeWalletId?: string; excludePasskeyId?: string },
): Promise<boolean> {
  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId))
  if (!user) return false

  const hasEmail = user.email != null && user.email !== ''

  const [oauthResult, walletResult, passkeyResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(account)
      .where(eq(account.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(walletIdentities)
      .where(eq(walletIdentities.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(passkeyCredentials)
      .where(eq(passkeyCredentials.userId, userId)),
  ])

  let oauthCount = oauthResult[0]?.count ?? 0
  let walletCount = walletResult[0]?.count ?? 0
  let passkeyCount = passkeyResult[0]?.count ?? 0

  if (options?.excludeProviderId && oauthCount > 0) {
    const [hasProvider] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, options.excludeProviderId)))
    if ((hasProvider?.count ?? 0) > 0) oauthCount -= 1
  }

  if (options?.excludeWalletId && walletCount > 0) {
    const [hasWallet] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(walletIdentities)
      .where(
        and(eq(walletIdentities.userId, userId), eq(walletIdentities.id, options.excludeWalletId)),
      )
    if ((hasWallet?.count ?? 0) > 0) walletCount -= 1
  }

  if (options?.excludePasskeyId && passkeyCount > 0) {
    const [hasPasskey] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(passkeyCredentials)
      .where(
        and(
          eq(passkeyCredentials.userId, userId),
          eq(passkeyCredentials.id, options.excludePasskeyId),
        ),
      )
    if ((hasPasskey?.count ?? 0) > 0) passkeyCount -= 1
  }

  const total = (hasEmail ? 1 : 0) + oauthCount + walletCount + passkeyCount
  return total >= 1
}
