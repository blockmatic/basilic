import type { FastifyPluginAsync } from 'fastify'
import { env } from '../lib/env.js'
import { verifyMagicLinkAndIssueToken } from './auth/magiclink/verify.js'
import { getReferenceHtml } from './reference/template.js'

const referenceRoutes: FastifyPluginAsync = async fastify => {
  // Serve OpenAPI JSON
  fastify.get(
    '/openapi.json',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
      },
    },
    async (_request, reply) => {
      const openApiDoc = fastify.swagger()
      return reply.send(openApiDoc)
    },
  )

  // Serve custom HTML page with Scalar UI and login button
  fastify.get(
    '/',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
      },
    },
    async (request, reply) => {
      // Use request.headers.host which includes port if present
      const host = request.headers.host || `${request.hostname}:${env.PORT}`
      const apiUrl = `${request.protocol}://${host}`
      const openApiUrl = `${apiUrl}/reference/openapi.json`
      const callbackUrl = `${apiUrl}/reference`

      // Magic link callback: token+verificationId in URL → verify server-side; verificationId only → code form (client-side)
      const query = request.query as { token?: string; verificationId?: string }
      const { token: urlToken, verificationId } = query
      let jwtToken: string | null = null
      if (urlToken && verificationId) {
        const result = await verifyMagicLinkAndIssueToken(fastify, request, {
          token: urlToken,
          verificationId,
        })
        jwtToken = result?.accessToken ?? null
      }

      const html = getReferenceHtml({
        apiUrl,
        openApiUrl,
        callbackUrl,
        jwtToken,
        verificationId: jwtToken ? undefined : (verificationId ?? undefined),
      })
      return reply.type('text/html').send(html)
    },
  )
}

export default referenceRoutes
export const prefixOverride = '/reference'
