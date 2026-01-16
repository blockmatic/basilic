import type { CatalogError } from '../types.js'

/**
 * Web app-specific error codes
 * These errors are specific to the web application
 */
export const webErrors = {
  DASHBOARD_DATA_LOAD_FAILED: {
    code: 'DASHBOARD_DATA_LOAD_FAILED',
    message: 'Failed to load dashboard data',
  },
} as const satisfies Record<string, CatalogError>
