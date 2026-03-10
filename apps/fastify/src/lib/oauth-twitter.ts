import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { encryptAccountTokens } from '../db/account.js'
import type { getDb } from '../db/index.js'
import { account, sessions, users } from '../db/schema/index.js'
import { env } from './env.js'
import { generateJti, hashToken } from './jwt.js'
import { generateFunnyUsername } from './username.js'

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
  error?: string
}

export type TwitterUser = { data?: { id: string; name?: string; username?: string } }

export type TwitterAccountData = {
  accessToken: string
  refreshToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string
}

export async function runTwitterExchangeTx(
  db: Awaited<ReturnType<typeof getDb>>,
  accountId: string,
  name: string,
  accountData: TwitterAccountData,
): Promise<{ userId: string; sessionId: string; refreshJti: string }> {
  return db.transaction(async tx => {
    const [existingAccount] = await tx
      .select()
      .from(account)
      .where(and(eq(account.providerId, 'twitter'), eq(account.accountId, accountId)))

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

    const sessionId = randomUUID()
    const refreshJti = generateJti()
    const refreshJtiHash = hashToken(refreshJti)
    const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

    await tx.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      token: refreshJtiHash,
      expiresAt: sessionExpiresAt,
    })

    return { userId: user.id, sessionId, refreshJti }
  })
}

export async function fetchTwitterOAuthData(input: {
  code: string
  codeVerifier: string
  oauthTwitterCallbackUrl: string
  twitterClientId: string
  twitterClientSecret: string
}): Promise<{ accountId: string; name: string; accountData: TwitterAccountData }> {
  const { code, codeVerifier, oauthTwitterCallbackUrl, twitterClientId, twitterClientSecret } =
    input
  const fetchTimeoutMs = 15_000
  const tokenBody = new URLSearchParams({
    /* biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case */
    grant_type: 'authorization_code',
    code,
    /* biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case */
    code_verifier: codeVerifier,
    /* biome-ignore lint/style/useNamingConvention: OAuth spec uses snake_case */
    redirect_uri: oauthTwitterCallbackUrl,
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
  if (!tokenRes.ok) throw new Error('TOKEN_EXCHANGE_FAILED')
  const tokenData = (await tokenRes.json()) as TwitterTokenResponse
  if (tokenData.error) throw new Error('TOKEN_EXCHANGE_FAILED')
  const accessToken = tokenData.access_token
  if (!accessToken) throw new Error('TOKEN_EXCHANGE_FAILED')
  const userRes = await fetch('https://api.x.com/2/users/me', {
    headers: {
      /* biome-ignore lint/style/useNamingConvention: HTTP header canonical form */
      Authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(fetchTimeoutMs),
  })
  if (!userRes.ok) throw new Error('USER_FETCH_FAILED')
  const userData = (await userRes.json()) as TwitterUser
  const twUser = userData.data
  if (!twUser?.id) throw new Error('USER_FETCH_FAILED')
  const accountId = twUser.id
  const name = twUser.name ?? twUser.username ?? 'Twitter user'
  const accountData: TwitterAccountData = {
    accessToken,
    refreshToken: tokenData.refresh_token ?? null,
    accessTokenExpiresAt: tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null,
    refreshTokenExpiresAt: null,
    scope: 'tweet.read users.read offline.access',
  }
  return { accountId, name, accountData }
}
