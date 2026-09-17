import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

// Define plugin options type
type HookPluginOptions = {
  enabled?: boolean
  logRequests?: boolean
}

// Plugin implementation with lifecycle hooks
const hookPlugin: FastifyPluginAsync<HookPluginOptions> = async (fastify, opts) => {
  const { enabled = true, logRequests = false } = opts

  if (!enabled) {
    fastify.log.warn('Hook plugin is disabled')
    return
  }

  // onRequest hook: Executes before request is parsed
  // Common uses: security headers, request logging, IP validation
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Add security headers
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')

    // Log request if enabled
    if (logRequests) {
      request.log.info({ method: request.method, url: request.url }, 'Request received')
    }
  })

  // preHandler hook: Executes after validation but before route handler
  // Common uses: authentication, authorization, request transformation
  fastify.addHook('preHandler', async (_request: FastifyRequest, _reply: FastifyReply) => {
    // Example: Check authentication
    // const token = _request.headers.authorization
    // if (!token) {
    //   return _reply.code(401).send({ error: 'Unauthorized' })
    // }
    // Attach data to request for use in route handlers
    // _request.user = await getUserFromToken(token)
  })

  // onResponse hook: Executes after response is sent
  // Common uses: response logging, metrics collection
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    if (logRequests) {
      request.log.info(
        {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
        },
        'Response sent',
      )
    }
  })

  // onError hook: Executes when an error occurs
  // Common uses: error logging, error transformation, security event logging
  fastify.addHook(
    'onError',
    async (
      request: FastifyRequest,
      _reply: FastifyReply,
      error: Error & { statusCode?: number },
    ) => {
      // Log error
      request.log.error({ error }, 'Request error')

      // Log security events
      if (error.statusCode === 429) {
        request.log.warn({ ip: request.ip }, 'Rate limit exceeded')
      } else if (error.statusCode === 401 || error.statusCode === 403) {
        request.log.warn({ statusCode: error.statusCode }, 'Authentication failure')
      }
    },
  )

  fastify.log.info('Hook plugin registered')
}

// Export wrapped plugin (non-encapsulated - shares context)
export default fp(hookPlugin, {
  name: 'hook-plugin',
})
