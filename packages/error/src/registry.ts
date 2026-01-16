import { mergedCatalog } from './catalogs/merge.js'
import type { CatalogError } from './types.js'

/**
 * Retrieves an error from the merged catalog by code
 * @param code - Error code to look up
 * @returns CatalogError if found, undefined otherwise
 */
export function getError(code: string): CatalogError | undefined {
  return (mergedCatalog as Record<string, CatalogError>)[code]
}
