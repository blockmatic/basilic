import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

// Define plugin options type
type MyPluginOptions = {
  enabled: boolean
  config?: {
    timeout?: number
  }
}

// Plugin implementation
const myPlugin: FastifyPluginAsync<MyPluginOptions> = async (fastify, opts) => {
  // Access typed options
  const { enabled, config } = opts

  if (!enabled) {
    fastify.log.warn('Plugin is disabled')
    return
  }

  // Add decorator to Fastify instance
  fastify.decorate('myUtility', (message: string) => {
    fastify.log.info({ message }, 'Utility called')
    return `Processed: ${message}`
  })

  // Type declaration for TypeScript (required for decorators)
  declare module 'fastify' {
    interface FastifyInstance {
      myUtility(message: string): string
    }
  }

  // Register routes in plugin
  fastify.get('/plugin-route', async (_request, reply) => {
    return reply.send({
      message: 'From plugin',
      timeout: config?.timeout ?? 5000,
    })
  })

  fastify.log.info({ timeout: config?.timeout }, 'Plugin registered')
}

// Export wrapped plugin (non-encapsulated - shares context)
export default fp(myPlugin, {
  name: 'my-plugin',
})
