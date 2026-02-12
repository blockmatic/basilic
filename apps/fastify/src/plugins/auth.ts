import { captureError } from '@repo/sentry/node'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { getDb } from '@/db/index.js'
import { sessions, users } from '@/db/schema/index.js'

declare module 'fastify' {
  interface FastifyRequest {
    session?: {
      user: {
        id: string
        email?: string | null
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
  // Session validation hook - JWT-only Bearer token support
  fastify.addHook('onRequest', async request => {
    try {
      const authHeader = request.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        request.session = null
        return
      }

      const token = authHeader.substring(7).trim()

      // Verify JWT
      const decoded = fastify.jwt.verify<{
        typ?: string
        sub?: string
        sid?: string
        exp?: number
      }>(token)

      // Only accept access tokens
      if (decoded.typ !== 'access' || !decoded.sub || !decoded.sid) {
        request.session = null
        return
      }

      // Load session from DB to verify it exists and is not expired
      const db = await getDb()
      const [session] = await db.select().from(sessions).where(eq(sessions.id, decoded.sid))

      if (!session || session.expiresAt < new Date()) {
        request.session = null
        return
      }

      // Load user
      const [user] = await db.select().from(users).where(eq(users.id, decoded.sub))
      if (!user) {
        request.session = null
        return
      }

      request.session = {
        user: {
          id: user.id,
          email: user.email ?? null,
        },
        session: {
          id: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt,
        },
      }
    } catch (error) {
      // JWT verification errors are expected for invalid tokens
      // Only log unexpected errors
      if (error instanceof Error && !error.message.includes('jwt')) {
        captureError({
          code: 'INTERNAL_ERROR',
          error,
          logger: request.log,
          label: 'auth.api.getSession failed',
          data: {
            method: request.method,
            url: request.url,
          },
          tags: {
            app: 'api',
            module: 'auth-service',
            route: request.url,
          },
        })
      }
      request.session = null
    }
  })
}

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['jwt'],
})
