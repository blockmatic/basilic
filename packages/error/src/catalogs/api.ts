import type { CatalogError } from '../types.js'

/**
 * API-specific error codes
 * These errors are specific to the API application
 */
export const apiErrors = {
  AI_MODEL_ERROR: {
    code: 'AI_MODEL_ERROR',
    message: 'AI model error occurred',
  },
  AI_RATE_LIMIT_EXCEEDED: {
    code: 'AI_RATE_LIMIT_EXCEEDED',
    message: 'AI rate limit exceeded',
  },
  BLOCKCHAIN_TRX_OP_FAILURE: {
    code: 'BLOCKCHAIN_TRX_OP_FAILURE',
    message: 'Blockchain transaction operation failed',
  },
  BLOCKCHAIN_BLOCK_PROCESSING_ERROR: {
    code: 'BLOCKCHAIN_BLOCK_PROCESSING_ERROR',
    message: 'Blockchain block processing error',
  },
} as const satisfies Record<string, CatalogError>
