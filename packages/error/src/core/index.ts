// Export types

export type { AllErrorCode } from '../catalogs/merge.js'

// Export merged catalog and types
export { mergedCatalog } from '../catalogs/merge.js'
// Export mappers
export { mapHttpStatusToErrorCode } from '../mappers.js'

// Export registry function
export { getError } from '../registry.js'
export type {
  CaptureErrorOptions,
  CatalogError,
  CoreErrorCode,
  ErrorWithMessage,
} from '../types.js'
// Export utilities
export {
  getErrorMessage,
  isErrorWithMessage,
  toErrorWithMessage,
} from '../utils.js'
