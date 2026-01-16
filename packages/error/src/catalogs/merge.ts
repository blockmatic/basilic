import type { CatalogError } from '../types.js'
import { apiErrors } from './api.js'
import { clientErrors } from './client.js'
import { commonErrors } from './common.js'
import { serverErrors } from './server.js'
import { webErrors } from './web.js'

/**
 * Validates error code format (UPPER_SNAKE_CASE)
 * Pattern: Must start with uppercase letter, contain only uppercase letters, numbers, and underscores,
 * and end with uppercase letter or number
 */
const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]*[A-Z0-9]$/

/**
 * Validates error code format
 * @throws Error if code format is invalid
 */
function validateErrorCode(code: string): void {
  if (!ERROR_CODE_PATTERN.test(code)) {
    throw new Error(
      `Invalid error code format: "${code}". ` +
        `Must be UPPER_SNAKE_CASE (e.g., NETWORK_ERROR, USER_NOT_FOUND)`,
    )
  }
}

/**
 * Validates a catalog object for error code format, duplicates, and code property matching
 * @throws Error if validation fails
 */
function validateCatalog(catalog: Record<string, CatalogError>): void {
  const seenCodes = new Set<string>()

  for (const [code, error] of Object.entries(catalog)) {
    // Validate code format
    validateErrorCode(code)

    // Validate code matches error.code property
    if (code !== error.code) {
      throw new Error(
        `Error code mismatch: key "${code}" does not match error.code "${error.code}"`,
      )
    }

    // Check for duplicates
    if (seenCodes.has(code)) {
      throw new Error(`Duplicate error code: ${code}`)
    }

    seenCodes.add(code)
  }
}

/**
 * Validates all catalogs individually, then checks for cross-catalog duplicates
 * @throws Error if validation fails or duplicates are found across catalogs
 */
function validateAndCheckDuplicates(): void {
  // Validate each catalog individually
  validateCatalog(serverErrors)
  validateCatalog(clientErrors)
  validateCatalog(commonErrors)
  validateCatalog(apiErrors)
  validateCatalog(webErrors)

  // Check for cross-catalog duplicates
  const seenCodes = new Set<string>()
  const catalogsWithNames: Array<[Record<string, CatalogError>, string]> = [
    [serverErrors, 'serverErrors'],
    [clientErrors, 'clientErrors'],
    [commonErrors, 'commonErrors'],
    [apiErrors, 'apiErrors'],
    [webErrors, 'webErrors'],
  ]

  for (const [catalog, catalogName] of catalogsWithNames) {
    for (const code of Object.keys(catalog)) {
      if (seenCodes.has(code)) {
        throw new Error(`Duplicate error code "${code}" found in ${catalogName}`)
      }
      seenCodes.add(code)
    }
  }
}

// Validate all catalogs and check for duplicates before merging
validateAndCheckDuplicates()

/**
 * Merged error catalog containing all error codes from all catalogs
 * This is created at build time and validated for format and duplicates
 * Using const spread preserves literal key types for AllErrorCode union type
 */
export const mergedCatalog = {
  ...serverErrors,
  ...clientErrors,
  ...commonErrors,
  ...apiErrors,
  ...webErrors,
} as const satisfies Record<string, CatalogError>

/**
 * All error codes from the merged catalog
 * This is a union type of all error code strings
 */
export type AllErrorCode = keyof typeof mergedCatalog
