import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '../lib/env.js'
import { detectSuspiciousActivity, logSecurityEvent } from '../lib/security.js'

type SecurityPluginOptions = Record<string, never>

const security: FastifyPluginAsync<SecurityPluginOptions> = async fastify => {
  // Only add security headers if enabled
  if (!env.SECURITY_HEADERS_ENABLED) {
    return
  }

  // onRequest hook: security headers + suspicious activity detection
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Detect suspicious patterns
    if (detectSuspiciousActivity(request)) {
      logSecurityEvent(request, 'suspicious_activity_detected', {
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      })
      // Log but don't block - let rate limiting handle abuse
      // In production, you might want to block or add to blocklist
    }

    // Log all requests in production for security monitoring
    if (env.NODE_ENV === 'production') {
      logSecurityEvent(request, 'request_received', {
        method: request.method,
        url: request.url,
      })
    }

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

    // Content Security Policy - more restrictive in production
    const isReferenceRoute = request.url.startsWith('/reference')

    if (env.NODE_ENV === 'production' && !isReferenceRoute) {
      // Strict CSP for API routes in production
      const cspDirectives = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
      ]
      reply.header('Content-Security-Policy', cspDirectives.join('; '))
    } else {
      // Relaxed CSP for Swagger UI (/reference routes) or development
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
    }

    // Strict Transport Security (HTTPS only in production)
    if (env.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
  })

  // onError hook: security event logging
  fastify.addHook(
    'onError',
    async (
      request: FastifyRequest,
      _reply: FastifyReply,
      error: Error & { statusCode?: number },
    ) => {
      // Log security-relevant errors
      if (error.statusCode === 429) {
        logSecurityEvent(request, 'rate_limit_exceeded')
      } else if (error.statusCode === 401 || error.statusCode === 403) {
        logSecurityEvent(request, 'authentication_failure', {
          statusCode: error.statusCode,
        })
      }
    },
  )
}

export default fp(security, {
  name: 'security-headers',
})
