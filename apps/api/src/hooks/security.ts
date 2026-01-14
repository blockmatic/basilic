import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../lib/env.js'
import { detectSuspiciousActivity, logSecurityEvent } from '../lib/security.js'

/**
 * Security hooks for request processing
 */
export const securityHooks = {
  /**
   * Hook to detect and log suspicious activity
   */
  onRequest: async (request: FastifyRequest, _reply: FastifyReply) => {
    // Detect suspicious patterns
    if (detectSuspiciousActivity(request)) {
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
  },

  /**
   * Hook to log security events on errors
   */
  onError: async (
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
}
