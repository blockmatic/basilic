import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { encryptAccountTokens } from '../../db/account.js'
import type { getDb } from '../../db/index.js'
import { account, users } from '../../db/schema/index.js'
import { generateFunnyUsername } from '../username.js'

/** OAuth API response; snake_case from Twitter API */
export type TwitterTokenResponse = {
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  access_token?: string
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  refresh_token?: string
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  token_type?: string
  /* biome-ignore lint/style/useNamingConvention: OAuth API uses snake_case */
  expires_in?: number
  scope?: string
  error?: string
}

export class OAuthUpstreamError extends Error {
  constructor(
    message: string,
    public readonly stage: 'token_exchange' | 'user_fetch',
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message)
    this.name = 'OAuthUpstreamError'
  }
}

export type TwitterUser = { data?: { id: string; name?: string; username?: string } }

export type TwitterAccountData = {
  accessToken: string
  refreshToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string
}

export type RunTwitterExchangeOptions = {
  db: Awaited<ReturnType<typeof getDb>>
  accountId: string
  name: string
  accountData: TwitterAccountData
  linkUserId?: string
}

export async function runTwitterExchangeTx(
  opts: RunTwitterExchangeOptions,
): Promise<{ userId: string }> {
  const { db, accountId, name, accountData, linkUserId } = opts
  return db.transaction(async tx => {
    const [existingAccount] = await tx
      .select()
      .from(account)
      .where(and(eq(account.providerId, 'twitter'), eq(account.accountId, accountId)))

    if (linkUserId) {
      if (existingAccount && existingAccount.userId !== linkUserId)
        throw new Error('PROVIDER_ALREADY_LINKED')
      const [u] = await tx.select().from(users).where(eq(users.id, linkUserId))
      if (!u) throw new Error('USER_NOT_FOUND')
      return runTwitterExchangeTxForUser({ tx, existingAccount, user: u, accountId, accountData })
    }

    let user: typeof users.$inferSelect | undefined
    if (existingAccount) {
      ;[user] = await tx.select().from(users).where(eq(users.id, existingAccount.userId))
    }
    if (!user) {
      const userId = randomUUID()
      const username = await generateFunnyUsername(tx)
      await tx.insert(users).values({
        id: userId,
        email: null,
        emailVerified: false,
        name,
        username,
      })
      ;[user] = await tx.select().from(users).where(eq(users.id, userId))
      if (!user) throw new Error('USER_CREATE_FAILED')
    }

    return runTwitterExchangeTxForUser({ tx, existingAccount, user, accountId, accountData })
  })
}

type TxType = Parameters<Parameters<Awaited<ReturnType<typeof getDb>>['transaction']>[0]>[0]

async function runTwitterExchangeTxForUser(params: {
  tx: TxType
  existingAccount: typeof account.$inferSelect | undefined
  user: typeof users.$inferSelect
  accountId: string
  accountData: TwitterAccountData
}): Promise<{ userId: string }> {
  const { tx, existingAccount, user, accountId, accountData } = params
  const accountRow = {
    id: existingAccount?.id ?? randomUUID(),
    userId: user.id,
    accountId,
    providerId: 'twitter' as const,
  }

  if (existingAccount) {
    const encrypted = encryptAccountTokens({
      accessToken: accountData.accessToken,
      refreshToken: accountData.refreshToken,
      updatedAt: new Date(),
    })
    await tx
      .update(account)
      .set({
        accessToken: encrypted.accessToken,
        refreshToken: encrypted.refreshToken,
        accessTokenExpiresAt: accountData.accessTokenExpiresAt,
        refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
        scope: accountData.scope,
        updatedAt: encrypted.updatedAt ?? new Date(),
      })
      .where(eq(account.id, existingAccount.id))
  } else {
    const toInsert = encryptAccountTokens({
      ...accountRow,
      accessToken: accountData.accessToken,
      refreshToken: accountData.refreshToken,
      idToken: null as string | null,
      accessTokenExpiresAt: accountData.accessTokenExpiresAt,
      refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
      scope: accountData.scope,
    })
    await tx.insert(account).values(toInsert)
  }

  return { userId: user.id }
}

export async function fetchTwitterOAuthData(input: {
  code: string
  codeVerifier: string
  redirectUri: string
  twitterClientId: string
  twitterClientSecret: string
}): Promise<{ accountId: string; name: string; accountData: TwitterAccountData }> {
  const { code, codeVerifier, redirectUri, twitterClientId, twitterClientSecret } = input
  const fetchTimeoutMs = 15_000
  const tokenBody = new URLSearchParams({
    /* biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case */
    grant_type: 'authorization_code',
    code,
    /* biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case */
    code_verifier: codeVerifier,
    /* biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case */
    redirect_uri: redirectUri,
  })
  const basicAuth = Buffer.from(`${twitterClientId}:${twitterClientSecret}`).toString('base64')
  const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      /* biome-ignore lint/style/useNamingConvention: HTTP header canonical form */
      Authorization: `Basic ${basicAuth}`,
    },
    body: tokenBody.toString(),
    signal: AbortSignal.timeout(fetchTimeoutMs),
  })
  if (!tokenRes.ok) {
    const body = await tokenRes.text().catch(() => '')
    throw new OAuthUpstreamError('TOKEN_EXCHANGE_FAILED', 'token_exchange', tokenRes.status, body)
  }
  const tokenData = (await tokenRes.json()) as TwitterTokenResponse
  if (tokenData.error || !tokenData.access_token)
    throw new OAuthUpstreamError(
      'TOKEN_EXCHANGE_FAILED',
      'token_exchange',
      400,
      tokenData.error ? tokenData : { error: 'missing access_token' },
    )

  const accessToken = tokenData.access_token
  const userRes = await fetch('https://api.x.com/2/users/me', {
    headers: {
      /* biome-ignore lint/style/useNamingConvention: HTTP header canonical form */
      Authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(fetchTimeoutMs),
  })
  if (!userRes.ok) {
    const body = await userRes.text().catch(() => '')
    throw new OAuthUpstreamError('USER_FETCH_FAILED', 'user_fetch', userRes.status, body)
  }
  const userData = (await userRes.json()) as TwitterUser
  const twUser = userData.data
  if (!twUser?.id) throw new OAuthUpstreamError('USER_FETCH_FAILED', 'user_fetch', 200, userData)

  const accountId = twUser.id
  const name = twUser.name ?? twUser.username ?? 'Twitter user'
  const refreshToken = tokenData.refresh_token ?? null
  const baseScope = (tokenData.scope ?? 'tweet.read users.read').trim()
  const scope =
    refreshToken && !baseScope.includes('offline.access')
      ? `${baseScope} offline.access`.trim()
      : baseScope || 'tweet.read users.read'
  const accountData: TwitterAccountData = {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null,
    refreshTokenExpiresAt: null,
    scope,
  }
  return { accountId, name, accountData }
}
