import { appContract } from '@basilic/contracts'
import { initServer } from '@ts-rest/fastify'
import type { FastifyPluginAsync } from 'fastify'

const healthRoutes: FastifyPluginAsync = async fastify => {
  const s = initServer()

  const router = s.router(appContract, {
    health: {
      // @ts-expect-error - ts-rest type inference issue with nested routers
      check: async () => {
        return {
          status: 200,
          body: {
            ok: true,
            now: new Date().toISOString(),
          },
        }
      },
    },
  })

  await fastify.register(s.plugin(router))
}

export default healthRoutes
