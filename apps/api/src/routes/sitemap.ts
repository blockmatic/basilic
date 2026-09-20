import type { FastifyPluginAsync } from 'fastify'
import { getRequestOrigin, publicDiscoveryPaths } from '../lib/agent/index.js'

function renderSitemapXml({ origin }: { origin: string }): string {
  const excluded = new Set<string>(['/robots.txt', '/sitemap.xml'])
  const locs = publicDiscoveryPaths
    .filter(path => !excluded.has(path))
    .map(path => `  <url><loc>${origin}${path}</loc></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs}\n</urlset>\n`
}

const sitemapRoute: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/sitemap.xml',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
      },
    },
    async (request, reply) =>
      reply
        .type('application/xml')
        .send(renderSitemapXml({ origin: getRequestOrigin({ request }) })),
  )
}

export default sitemapRoute
