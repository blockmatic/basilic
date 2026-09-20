import type { FastifyPluginAsync } from 'fastify'
import { sendLandingPage } from '../lib/agent/index.js'

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get(
    '/',
    {
      schema: {
        hide: true,
        tags: ['public'],
        security: [],
      },
    },
    async (request, reply) => sendLandingPage({ request, reply }),
  )
}

export default root
