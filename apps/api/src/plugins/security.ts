import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '../lib/env.js'

type SecurityPluginOptions = Record<string, never>

const security: FastifyPluginAsync<SecurityPluginOptions> = async fastify => {
  // Only add security headers if enabled
  if (!env.SECURITY_HEADERS_ENABLED) {
    return
  }

  // Add security headers via onRequest hook
  fastify.addHook('onRequest', async (_request, reply) => {
    // Prevent MIME type sniffing
    reply.header('X-Content-Type-Options', 'nosniff')

    // Prevent clickjacking attacks
    reply.header('X-Frame-Options', 'DENY')

    // Enable XSS protection (legacy but still useful)
    reply.header('X-XSS-Protection', '1; mode=block')

    // Control referrer information
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Restrict browser features
    reply.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    )

    // Content Security Policy
    // Allow self, data URIs for images, and inline styles/scripts only for Swagger UI
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Swagger UI
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ]
    reply.header('Content-Security-Policy', cspDirectives.join('; '))

    // Strict Transport Security (HTTPS only in production)
    if (env.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
  })
}

export default fp(security, {
  name: 'security-headers',
})
