import { appContract } from '@basilic/contracts'
import { initServer } from '@ts-rest/fastify'
import type { FastifyPluginAsync } from 'fastify'

const healthRoutes: FastifyPluginAsync = async fastify => {
  const s = initServer()

  s.router(appContract, {
    health: {
      check: async () => ({
        status: 200 as const,
        body: {
          ok: true,
          now: new Date().toISOString(),
        },
      }),
    },
  })

  await fastify.register(s.plugin)
}

export default healthRoutes
