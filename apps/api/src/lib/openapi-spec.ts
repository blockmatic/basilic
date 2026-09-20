import { env } from './env.js'
import { openapiSecurity } from './openapi-security.js'

function trimSlash({ url }: { url: string }): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function headerMap(
  entries: { name: string; description: string }[],
): Record<string, { description: string; schema: { type: 'string' } }> {
  return Object.fromEntries(
    entries.map(({ name, description }) => [
      name,
      { description, schema: { type: 'string' as const } },
    ]),
  )
}

export function getOpenApiDocumentOptions(): {
  openapi: {
    info: {
      title: string
      version: string
      description: string
      license: { name: string; url: string }
      contact: { url: string }
    }
    externalDocs: { description: string; url: string }
    servers: { url: string }[]
    components: {
      securitySchemes: (typeof openapiSecurity)['components']['securitySchemes']
      headers: Record<string, { description: string; schema: { type: 'string' } }>
    }
    security: (typeof openapiSecurity)['security']
  }
} {
  const docs = trimSlash({ url: env.DOCS_SITE_URL })
  return {
    openapi: {
      info: {
        title: 'Basilic API',
        version: '1.0.0',
        description: [
          'Typed REST API on Fastify 5.',
          'Authenticate with a Bearer JWT issued by this host or an X-API-Key / Bearer bask_<prefix>_<secret>.',
          'This host is a resource server plus a social login client, not an OAuth authorization server.',
          'It does not expose MCP, GraphQL, or a plugin manifest.',
        ].join(' '),
        license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
        contact: { url: docs },
      },
      externalDocs: {
        description: 'Authentication',
        url: `${docs}/docs/architecture/authentication`,
      },
      servers: [{ url: '/' }],
      components: {
        securitySchemes: openapiSecurity.components.securitySchemes,
        headers: headerMap([
          {
            name: 'RateLimit',
            description: 'IETF RateLimit quota for the matched policy',
          },
          {
            name: 'RateLimit-Policy',
            description: 'IETF RateLimit-Policy describing quota and window',
          },
          {
            name: 'Retry-After',
            description: 'Seconds until a 429 client may retry',
          },
          {
            name: 'x-ratelimit-limit',
            description: 'Maximum requests in the current window',
          },
          {
            name: 'x-ratelimit-remaining',
            description: 'Remaining requests in the current window',
          },
          {
            name: 'x-ratelimit-reset',
            description: 'Seconds until the current window resets',
          },
        ]),
      },
      security: openapiSecurity.security,
    },
  }
}
