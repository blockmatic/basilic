import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { getDb } from '../db/index.js'
import { sessions, users } from '../db/schema/index.js'
import { authenticateWithApiKey } from '../lib/api-keys/index.js'

declare module 'fastify' {
  interface FastifyRequest {
    session?: {
      authKind: 'jwt' | 'api-key'
      user: {
        id: string
        email?: string | null
        name?: string | null
        username?: string | null
        wallet?: { chain: string; address: string }
      }
      session: {
        id: string
        userId: string
        expiresAt: Date
      }
    } | null
  }
}

const authPlugin: FastifyPluginAsync = async fastify => {
  fastify.addHook('onRequest', async request => {
    const apiKeyHeader = request.headers['x-api-key']
    const authHeader = request.headers.authorization

    const apiKeyToken =
      typeof apiKeyHeader === 'string'
        ? apiKeyHeader.trim()
        : authHeader?.startsWith('Bearer ')
          ? authHeader.substring(7).trim().startsWith('bask_')
            ? authHeader.substring(7).trim()
            : null
          : null

    if (apiKeyToken) {
      const db = await getDb()
      const session = await authenticateWithApiKey(apiKeyToken, db)
      request.session = session ? { ...session, authKind: 'api-key' as const } : null
      return
    }

    if (!authHeader?.startsWith('Bearer ')) {
      request.session = null
      return
    }

    const token = authHeader.substring(7).trim()

    let decoded: {
      typ?: string
      sub?: string
      sid?: string
      exp?: number
    }
    try {
      decoded = fastify.jwt.verify<typeof decoded>(token)
    } catch {
      request.session = null
      return
    }

    if (decoded.typ !== 'access' || !decoded.sub || !decoded.sid) {
      request.session = null
      return
    }

    const db = await getDb()
    const [session] = await db.select().from(sessions).where(eq(sessions.id, decoded.sid))

    if (!session || session.expiresAt < new Date()) {
      request.session = null
      return
    }

    if (session.userId !== decoded.sub) {
      request.session = null
      return
    }

    const [user] = await db.select().from(users).where(eq(users.id, decoded.sub))
    if (!user) {
      request.session = null
      return
    }

    const wallet =
      session.walletChain && session.walletAddress
        ? { chain: session.walletChain, address: session.walletAddress }
        : undefined

    request.session = {
      authKind: 'jwt',
      user: {
        id: user.id,
        email: user.email ?? null,
        name: user.name ?? null,
        username: user.username ?? null,
        ...(wallet && { wallet }),
      },
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    }
  })
}

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['jwt'],
})
