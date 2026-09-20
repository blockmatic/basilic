import type { FastifyPluginAsync } from 'fastify'
import { getLandingUrls, getRequestOrigin } from '../lib/agent/index.js'

function renderLlmsTxt({ origin }: { origin: string }): string {
  const { docs, cli } = getLandingUrls()
  return [
    '# Basilic Fastify API',
    '',
    'This process is the product API on Fastify 5. It is not a second documentation site.',
    '',
    '## Authentication',
    '',
    '- Session access tokens use `Authorization: Bearer` with a JWT issued by this host.',
    '- API keys use `X-API-Key: bask_<prefix>_<secret>` or `Authorization: Bearer bask_<prefix>_<secret>`.',
    '- `/auth/oauth/*` is a social login client (GitHub, Google, Facebook, Twitter), not an OAuth authorization server.',
    '- This host has no JWKS and does not serve `/.well-known/oauth-authorization-server`.',
    '',
    '## Machine-readable',
    '',
    `- OpenAPI: ${origin}/openapi.json`,
    `- Human reference (Scalar, needs JavaScript): ${origin}/reference`,
    `- Readiness: ${origin}/health`,
    `- API catalog (RFC 9727): ${origin}/.well-known/api-catalog`,
    `- OAuth protected resource metadata (RFC 9728): ${origin}/.well-known/oauth-protected-resource`,
    '',
    '## CLI',
    '',
    `Typed clients and the CLI are documented at ${cli}.`,
    '',
    '## Docs for agents',
    '',
    `Adopter documentation index: ${docs}/llms.txt`,
    '',
    '## Not on this host',
    '',
    'This host has no MCP, no GraphQL, and no ChatGPT plugin manifest.',
    '',
  ].join('\n')
}

const llmsTxtRoute: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/llms.txt',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
      },
    },
    async (request, reply) =>
      reply
        .type('text/plain; charset=utf-8')
        .send(renderLlmsTxt({ origin: getRequestOrigin({ request }) })),
  )
}

export default llmsTxtRoute
