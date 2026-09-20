import type { FastifyPluginAsync } from 'fastify'
import {
  applyAgentDiscoveryHeaders,
  getRequestOrigin,
  negotiateAccept,
  renderReferenceMarkdown,
} from '../../lib/agent/index.js'
import { sendOpenApiDocument } from '../../lib/openapi-document.js'
import { verifyMagicLinkAndIssueToken } from '../auth/magiclink/verify.js'
import { getReferenceHtml } from './template.js'

const referenceRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/openapi.json',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
      },
    },
    async (request, reply) => sendOpenApiDocument({ fastify, request, reply }),
  )

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
      const origin = getRequestOrigin({ request })
      const openApiUrl = `${origin}/openapi.json`
      const callbackUrl = `${origin}/reference`

      const query = request.query as { token?: string; verificationId?: string }
      const { token: urlToken, verificationId } = query
      const wantsMarkdown =
        negotiateAccept({
          acceptHeader:
            typeof request.headers.accept === 'string' ? request.headers.accept : undefined,
        }) === 'markdown'
      if (wantsMarkdown && !urlToken && !verificationId) {
        applyAgentDiscoveryHeaders({ reply })
        return reply
          .type('text/markdown; charset=utf-8')
          .send(renderReferenceMarkdown({ openApiUrl }))
      }

      let jwtToken: string | null = null
      if (urlToken && verificationId) {
        const result = await verifyMagicLinkAndIssueToken(fastify, request, {
          token: urlToken,
          verificationId,
        })
        if (result && 'collision' in result)
          return reply.code(500).type('text/plain').send('Authentication failed')
        jwtToken = result?.accessToken ?? null
      }

      const html = getReferenceHtml({
        apiUrl: origin,
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
