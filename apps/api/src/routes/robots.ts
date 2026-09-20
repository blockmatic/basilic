import type { FastifyPluginAsync } from 'fastify'
import { getRequestOrigin, publicDiscoveryPaths } from '../lib/agent/index.js'

function renderRobotsTxt({ origin }: { origin: string }): string {
  const allows = publicDiscoveryPaths.map(path => `Allow: ${path}`).join('\n')
  return `User-agent: *\n${allows}\n\nSitemap: ${origin}/sitemap.xml\n`
}

const robotsRoute: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/robots.txt',
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
        .send(renderRobotsTxt({ origin: getRequestOrigin({ request }) })),
  )
}

export default robotsRoute
