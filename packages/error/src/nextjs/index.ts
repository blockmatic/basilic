// Re-export core functionality (types) and utils
export * from '../core/index.js'
export { getErrorMessage } from '../utils/index.js'

export { captureError } from './capture.js'
export { type InitErrorReportingOptions, initErrorReporting } from './sentry.js'
