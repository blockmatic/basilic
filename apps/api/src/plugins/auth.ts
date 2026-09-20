import { getDb, getValidSession } from '@repo/db'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
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

    const valid = await getValidSession({ sid: decoded.sid, userId: decoded.sub })
    if (!valid) {
      request.session = null
      return
    }
    const { session, user } = valid

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
