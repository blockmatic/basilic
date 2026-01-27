import type { FastifyPluginAsync } from 'fastify'
import { env } from '../lib/env.js'
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

      // Handle magic link callback: verify token and get JWT
      let jwtToken: string | null = null
      const token = (request.query as { token?: string })?.token

      if (token) {
        try {
          const verifyResponse = await fastify.inject({
            method: 'POST',
            url: '/auth/magiclink/verify',
            payload: { token },
          })

          if (verifyResponse.statusCode === 200) {
            const verifyData = verifyResponse.json() as { token: string; refreshToken: string }
            jwtToken = verifyData.token
          }
        } catch (error) {
          fastify.log.error({ err: error }, 'Failed to verify magic link token')
        }
      }

      const html = getReferenceHtml(apiUrl, openApiUrl, callbackUrl, jwtToken)
      return reply.type('text/html').send(html)
    },
  )
}

export default referenceRoutes
export const prefixOverride = '/reference'
