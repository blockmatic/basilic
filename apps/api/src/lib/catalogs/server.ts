/**
 * Server-side HTTP error codes
 * These errors are used for server responses and API errors
 */
export const serverErrors = {
  UNEXPECTED_ERROR: {
    code: 'UNEXPECTED_ERROR',
    message: 'An unexpected error occurred',
  },
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
  USE_KEY_REVOKE: {
    code: 'USE_KEY_REVOKE',
    message: 'API keys cannot be logged out; revoke the key instead',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Access forbidden',
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    message: 'Invalid input provided',
  },
  INVALID_PAYLOAD: {
    code: 'INVALID_PAYLOAD',
    message: 'Invalid payload',
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: 'Resource conflict',
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
  },
  TOO_MANY_ATTEMPTS: {
    code: 'TOO_MANY_ATTEMPTS',
    message: 'Too many failed attempts. Try again later.',
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
  CONFIGURATION_ERROR: {
    code: 'CONFIGURATION_ERROR',
    message: 'Server configuration error',
  },
  // Auth / session
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Invalid or expired token',
  },
  EXPIRED_TOKEN: {
    code: 'EXPIRED_TOKEN',
    message: 'Token has expired',
  },
  SESSION_NOT_FOUND: {
    code: 'SESSION_NOT_FOUND',
    message: 'Session not found',
  },
  TOKEN_REUSE_DETECTED: {
    code: 'TOKEN_REUSE_DETECTED',
    message: 'Token reuse detected - session revoked',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
  },
  // Web3 / wallet
  INVALID_ADDRESS: {
    code: 'INVALID_ADDRESS',
    message: 'Invalid wallet address',
  },
  INVALID_CHAIN: {
    code: 'INVALID_CHAIN',
    message: 'Invalid chain',
  },
  INVALID_MESSAGE: {
    code: 'INVALID_MESSAGE',
    message: 'Invalid message format',
  },
  INVALID_DOMAIN: {
    code: 'INVALID_DOMAIN',
    message: 'Domain mismatch',
  },
  INVALID_NONCE: {
    code: 'INVALID_NONCE',
    message: 'Invalid or unknown nonce',
  },
  EXPIRED_NONCE: {
    code: 'EXPIRED_NONCE',
    message: 'Nonce has expired',
  },
  INVALID_SIGNATURE: {
    code: 'INVALID_SIGNATURE',
    message: 'Invalid signature',
  },
  WALLET_ALREADY_LINKED: {
    code: 'WALLET_ALREADY_LINKED',
    message: 'Wallet already linked',
  },
  INVALID_CALLBACK_URL: {
    code: 'INVALID_CALLBACK_URL',
    message: 'Invalid callback URL',
  },
  MISSING_CODE: {
    code: 'MISSING_CODE',
    message: 'Code is required',
  },
  INVALID_OR_EXPIRED_CODE: {
    code: 'INVALID_OR_EXPIRED_CODE',
    message: 'Invalid or expired code',
  },
  // OAuth
  OAUTH_NOT_CONFIGURED: {
    code: 'OAUTH_NOT_CONFIGURED',
    message: 'OAuth provider is not configured',
  },
  INVALID_STATE: {
    code: 'INVALID_STATE',
    message: 'Invalid or expired state',
  },
  INVALID_REDIRECT_URI: {
    code: 'INVALID_REDIRECT_URI',
    message: 'redirect_uri must be one of the configured callback URLs',
  },
  EXPIRED_STATE: {
    code: 'EXPIRED_STATE',
    message: 'State has expired',
  },
  TOKEN_EXCHANGE_FAILED: {
    code: 'TOKEN_EXCHANGE_FAILED',
    message: 'Token exchange failed',
  },
  USER_INFO_FAILED: {
    code: 'USER_INFO_FAILED',
    message: 'Failed to fetch user info',
  },
  FETCH_USER_FAILED: {
    code: 'FETCH_USER_FAILED',
    message: 'Failed to fetch user',
  },
  EMAIL_REQUIRED: {
    code: 'EMAIL_REQUIRED',
    message: 'Email is required',
  },
  PROVIDER_ALREADY_LINKED: {
    code: 'PROVIDER_ALREADY_LINKED',
    message: 'Provider already linked',
  },
  USER_CREATE_FAILED: {
    code: 'USER_CREATE_FAILED',
    message: 'Failed to create user',
  },
  INVALID_CREDENTIAL: {
    code: 'INVALID_CREDENTIAL',
    message: 'Invalid credential',
  },
  EMAIL_NOT_VERIFIED: {
    code: 'EMAIL_NOT_VERIFIED',
    message: 'Email not verified',
  },
  // Passkey
  EXPIRED_CHALLENGE: {
    code: 'EXPIRED_CHALLENGE',
    message: 'Challenge has expired',
  },
  INVALID_ORIGIN: {
    code: 'INVALID_ORIGIN',
    message: 'Invalid origin',
  },
  MISSING_ORIGIN: {
    code: 'MISSING_ORIGIN',
    message: 'Origin is required',
  },
  ORIGIN_MISMATCH: {
    code: 'ORIGIN_MISMATCH',
    message: 'Origin mismatch',
  },
  VERIFICATION_FAILED: {
    code: 'VERIFICATION_FAILED',
    message: 'Verification failed',
  },
  INVALID_USER_HANDLE: {
    code: 'INVALID_USER_HANDLE',
    message: 'Invalid user handle',
  },
  MISSING_CREDENTIAL_ID: {
    code: 'MISSING_CREDENTIAL_ID',
    message: 'Assertion missing credential id',
  },
  UNKNOWN_CREDENTIAL: {
    code: 'UNKNOWN_CREDENTIAL',
    message: 'Credential not found',
  },
  INVALID_COUNTER: {
    code: 'INVALID_COUNTER',
    message: 'Invalid counter',
  },
  COUNTER_UPDATE_FAILED: {
    code: 'COUNTER_UPDATE_FAILED',
    message: 'Failed to update counter',
  },
  // Account linking / profile
  EMAIL_ALREADY_SET: {
    code: 'EMAIL_ALREADY_SET',
    message: 'Email already set',
  },
  EMAIL_ALREADY_IN_USE: {
    code: 'EMAIL_ALREADY_IN_USE',
    message: 'Email already in use',
  },
  EMAIL_NOT_CHANGED: {
    code: 'EMAIL_NOT_CHANGED',
    message: 'Email has not changed',
  },
  LAST_SIGN_IN_METHOD: {
    code: 'LAST_SIGN_IN_METHOD',
    message: 'Cannot remove last sign-in method',
  },
  NOT_LINKED: {
    code: 'NOT_LINKED',
    message: 'Account not linked',
  },
  EXPIRED_SETUP: {
    code: 'EXPIRED_SETUP',
    message: 'Setup has expired',
  },
  INVALID_CODE: {
    code: 'INVALID_CODE',
    message: 'Invalid code',
  },
  USERNAME_TAKEN: {
    code: 'USERNAME_TAKEN',
    message: 'Username is already taken',
  },
  // AI upstream
  UPSTREAM_SERVICE_ERROR: {
    code: 'UPSTREAM_SERVICE_ERROR',
    message: 'Upstream service error',
  },
  INSUFFICIENT_CREDITS: {
    code: 'INSUFFICIENT_CREDITS',
    message: 'Insufficient credits',
  },
  UPSTREAM_TIMEOUT: {
    code: 'UPSTREAM_TIMEOUT',
    message: 'Upstream request timed out',
  },
} as const
