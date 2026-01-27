/**
 * Web app-specific error codes
 * These errors are specific to the web application
 */
export const webErrors = {
  DASHBOARD_DATA_LOAD_FAILED: {
    code: 'DASHBOARD_DATA_LOAD_FAILED',
    message: 'Failed to load dashboard data',
  },
  MAGIC_LINK_SEND_FAILED: {
    code: 'MAGIC_LINK_SEND_FAILED',
    message: 'Failed to send magic link. Please try again.',
  },
} as const
