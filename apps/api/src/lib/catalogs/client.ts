/**
 * Client-side error codes
 * These errors are used for client-side validation and network issues
 */
export const clientErrors = {
  CLIENT_FORMAT_ERROR: {
    code: "CLIENT_FORMAT_ERROR",
    message: "Invalid format",
  },
  CLIENT_VALIDATION_ERROR: {
    code: "CLIENT_VALIDATION_ERROR",
    message: "Validation error",
  },
  FETCH_ERROR: {
    code: "FETCH_ERROR",
    message: "Failed to fetch resource",
  },
  INVALID_EXPRESSION: {
    code: "INVALID_EXPRESSION",
    message: "Invalid expression",
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "A network error occurred",
  },
  NETWORK_TIMEOUT: {
    code: "NETWORK_TIMEOUT",
    message: "Network request timed out",
  },
} as const;
