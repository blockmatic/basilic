import { randomUUID } from 'node:crypto'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { getDb } from '../../db/index.js'
import { sessions } from '../../db/schema/index.js'
import type { SignInMethod } from '../../db/schema/tables/sessions.js'
import { env } from '../env.js'
import {
  createAccessTokenPayload,
  createRefreshTokenPayload,
  generateJti,
  hashToken,
} from '../jwt.js'
import { sessionDeviceFromRequest } from './device.js'
import { notifyNewDeviceSignIn, type SessionNotifyUser } from './notify.js'
import { loadSessionUser } from './user.js'

type DbForSession = Pick<Awaited<ReturnType<typeof getDb>>, 'insert' | 'select'>

export async function createSessionAndIssueTokens({
  fastify,
  db,
  request,
  user,
  signInMethod,
  wallet,
}: {
  fastify: FastifyInstance
  db: DbForSession
  request: FastifyRequest
  user: SessionNotifyUser
  signInMethod: SignInMethod
  wallet?: { chain: string; address: string }
}) {
  const sessionId = randomUUID()
  const refreshJti = generateJti()
  const refreshJtiHash = hashToken(refreshJti)
  const sessionExpiresAt = new Date(Date.now() + env.REFRESH_JWT_EXPIRES_IN_SECONDS * 1000)
  const device = sessionDeviceFromRequest(request)

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    token: refreshJtiHash,
    expiresAt: sessionExpiresAt,
    ipAddress: device.ipAddress,
    userAgent: device.userAgent,
    signInMethod,
    deviceLabel: device.deviceLabel,
    location: device.location,
    deviceFingerprint: device.deviceFingerprint,
    ...(wallet && { walletChain: wallet.chain, walletAddress: wallet.address }),
  })

  await notifyNewDeviceSignIn({
    fastify,
    db,
    sessionId,
    user,
    signInMethod,
    deviceLabel: device.deviceLabel,
    deviceFingerprint: device.deviceFingerprint,
    ipAddress: device.ipAddress,
    location: device.location,
    expiresAt: sessionExpiresAt,
  })

  const accessPayload = createAccessTokenPayload({ userId: user.id, sessionId, wallet })
  const refreshPayload = createRefreshTokenPayload({ userId: user.id, sessionId, jti: refreshJti })

  const accessToken = fastify.jwt.sign(accessPayload, {
    expiresIn: `${env.ACCESS_JWT_EXPIRES_IN_SECONDS}s`,
  })
  const refreshToken = fastify.jwt.sign(refreshPayload, {
    expiresIn: `${env.REFRESH_JWT_EXPIRES_IN_SECONDS}s`,
  })

  request.log.info({ userId: user.id, sessionId, signInMethod }, 'session_issued')

  return { accessToken, refreshToken }
}

export async function createSessionAndIssueTokensForUserId({
  fastify,
  db,
  request,
  userId,
  signInMethod,
  wallet,
}: {
  fastify: FastifyInstance
  db: DbForSession
  request: FastifyRequest
  userId: string
  signInMethod: SignInMethod
  wallet?: { chain: string; address: string }
}) {
  const user = await loadSessionUser({ db, userId })
  if (!user) throw new Error('USER_NOT_FOUND')
  return createSessionAndIssueTokens({ fastify, db, request, user, signInMethod, wallet })
}
