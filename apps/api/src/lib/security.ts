import type { FastifyRequest } from 'fastify'

/**
 * Decode HTML entities (basic set)
 */
const decodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#x60;/gi, '`')
    .replace(/&#x3D;/gi, '=')
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number.parseInt(dec, 10)))
    .replace(/&#x([a-f\d]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
}

/**
 * Decode URL-encoded strings
 */
const decodeUrlEncoding = (str: string): string => {
  try {
    return decodeURIComponent(str)
  } catch {
    // If decoding fails, return original string
    return str
  }
}

/**
 * Sanitize input string to prevent XSS attacks
 *
 * This function iteratively normalizes and strips dangerous input until stable.
 * It handles:
 * - URL-encoded and HTML-encoded entities
 * - Multiple dangerous protocols (javascript:, data:, vbscript:, etc.)
 * - Event handlers (onclick, onerror, etc.)
 * - HTML tags and angle brackets
 *
 * Note: This is a basic sanitization utility. For production use cases requiring
 * comprehensive HTML sanitization, consider using a vetted library like DOMPurify
 * or validator.js.
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input
  let previousLength = 0
  const maxIterations = 10 // Prevent infinite loops

  // Iteratively sanitize until no more changes occur
  for (let i = 0; i < maxIterations; i++) {
    previousLength = sanitized.length

    // Step 1: Decode URL encoding
    sanitized = decodeUrlEncoding(sanitized)

    // Step 2: Decode HTML entities
    sanitized = decodeHtmlEntities(sanitized)

    // Step 3: Remove dangerous protocols (case-insensitive)
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/file:/gi, '')
      .replace(/about:/gi, '')

    // Step 4: Remove event handlers (onclick=, onerror=, etc.)
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')

    // Step 5: Remove HTML tags and angle brackets
    sanitized = sanitized.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')

    // Step 6: Remove null bytes and other control characters
    sanitized = sanitized.replace(/\0/g, '')
    // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional control character removal for security
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '') // eslint-disable-line no-control-regex

    // If no changes occurred, we're done
    if (sanitized.length === previousLength) {
      break
    }
  }

  return sanitized.trim()
}

/**
 * Sanitize error message to prevent information leakage
 * Removes sensitive information like stack traces, paths, etc.
 */
export const sanitizeErrorMessage = (error: unknown, isProduction: boolean): string => {
  if (isProduction) {
    // In production, return generic error messages
    if (error instanceof Error) {
      // Only return error name and a generic message
      return `An error occurred: ${error.name}`
    }
    return 'An error occurred'
  }

  // In development, return full error message
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

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
export const detectSuspiciousActivity = (request: FastifyRequest): boolean => {
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
    return true
  }

  // Check user agent
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent(request, 'suspicious_user_agent', { userAgent })
    return true
  }

  return false
}

/**
 * Validate CORS origin
 */
export const validateOrigin = (origin: string, allowedOrigins: string[] | '*'): boolean => {
  if (allowedOrigins === '*') {
    return true
  }

  return allowedOrigins.includes(origin)
}
