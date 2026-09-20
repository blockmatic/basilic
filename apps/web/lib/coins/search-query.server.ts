import { createLoader } from 'nuqs/server'
import { searchQueryParsers } from './search-query'

export const loadSearchQuery = createLoader(searchQueryParsers)
