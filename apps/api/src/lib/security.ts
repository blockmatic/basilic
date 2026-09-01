import type { FastifyRequest } from 'fastify'

/**
 * Log security event with enhanced context
 */
export const logSecurityEvent = (
  request: FastifyRequest,
  event: string,
  details?: Record<string, unknown>,
): void => {
  const userAgent = request.headers['user-agent'] || ''
  const forwarded = request.headers['x-forwarded-for']

  const logData = {
    event,
    timestamp: new Date().toISOString(),
    // Note: requestId automatically included via requestIdLogLabel: 'reqId'
    ip: request.ip,
    xForwardedFor: forwarded,
    method: request.method,
    url: request.url,
    userAgent,
    // User agent patterns for analysis
    userAgentPattern:
      userAgent.length > 0
        ? {
            isBot: /bot|crawler|spider|scraper/i.test(userAgent),
            isMobile: /mobile|android|iphone|ipad/i.test(userAgent),
            isBrowser: /mozilla|chrome|safari|firefox|edge/i.test(userAgent),
          }
        : null,
    // Additional request context
    headers: {
      origin: request.headers.origin,
      referer: request.headers.referer,
      host: request.headers.host,
    },
    ...details,
  }

  // Use Fastify's native logger - request ID automatically included
  request.log.warn({ security: true, ...logData }, `Security event: ${event}`)
}

/**
 * Detect suspicious activity patterns
 */
export const detectSuspiciousActivity = (request: FastifyRequest): void => {
  const userAgent = request.headers['user-agent'] || ''
  const url = request.url

  // Check for common attack patterns
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection attempts
    /exec\(/i, // Code execution attempts
    /eval\(/i, // Code evaluation attempts
  ]

  // Check URL
  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    logSecurityEvent(request, 'suspicious_url_pattern', { url })
    return
  }

  // Check user agent
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent(request, 'suspicious_user_agent', { userAgent })
  }
}
