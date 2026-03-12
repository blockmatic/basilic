import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import type { getDb } from '../db/index.js'
import { sessions } from '../db/schema/index.js'
import { env } from './env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from './jwt.js'

type DbForSession = Pick<Awaited<ReturnType<typeof getDb>>, 'insert'>

export async function createSessionAndIssueTokens({
  fastify,
  db,
  userId,
  wallet,
}: {
  fastify: FastifyInstance
  db: DbForSession
  userId: string
  wallet?: { chain: string; address: string }
}) {
  const sessionId = randomUUID()
  const refreshJti = generateJti()
  const refreshJtiHash = hashToken(refreshJti)
  const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token: refreshJtiHash,
    expiresAt: sessionExpiresAt,
    ...(wallet && { walletChain: wallet.chain, walletAddress: wallet.address }),
  })

  const accessPayload = createAccessTokenPayload({ userId, sessionId, wallet })
  const refreshPayload = createRefreshTokenPayload({ userId, sessionId, jti: refreshJti })

  const accessToken = fastify.jwt.sign(accessPayload, {
    expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
  })
  const refreshToken = fastify.jwt.sign(refreshPayload, {
    expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
  })

  return { accessToken, refreshToken }
}
