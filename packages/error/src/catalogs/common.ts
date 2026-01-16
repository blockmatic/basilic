import type { CatalogError } from '../types.js'

/**
 * Common error codes
 * These errors are used across both server and client
 */
export const commonErrors = {
  UNEXPECTED_ERROR: {
    code: 'UNEXPECTED_ERROR',
    message: 'An unexpected error occurred',
  },
} as const satisfies Record<string, CatalogError>
