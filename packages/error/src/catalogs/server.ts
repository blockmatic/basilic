import type { CatalogError } from '../types.js'

/**
 * Server-side HTTP error codes
 * These errors are used for server responses and API errors
 */
export const serverErrors = {
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'An internal server error occurred',
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Invalid request',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Resource not found',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Access forbidden',
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    message: 'Invalid input provided',
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: 'Resource conflict',
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
  },
  BAD_GATEWAY: {
    code: 'BAD_GATEWAY',
    message: 'Bad gateway',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'Service unavailable',
  },
  GATEWAY_TIMEOUT: {
    code: 'GATEWAY_TIMEOUT',
    message: 'Gateway timeout',
  },
} as const satisfies Record<string, CatalogError>
