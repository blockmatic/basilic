import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '@repo/utils/logger/server'

const scriptFile = fileURLToPath(import.meta.url)
const scriptDir = dirname(scriptFile)
const openapiPath = join(scriptDir, '../../../apps/fastify/openapi/openapi.json')
const outputPath = join(scriptDir, '../src/api-wrapper.gen.ts')
const apiClientOutputPath = join(scriptDir, '../src/api-client.gen.ts')

// Convert string to camelCase; strip {...} from path params for valid keys
function toCamelCase(str) {
  const cleaned = str.replace(/^\{|\}$/g, '')
  return cleaned.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Extract action key from operationId (e.g. accountApikeysCreate -> create)
function toActionKey(operationId) {
  const match = operationId.match(/[A-Z][a-z]+$/)
  return match ? match[0].toLowerCase() : operationId
}

// operationId (camelCase) -> hey-api type prefix (PascalCase), e.g. getUser -> GetUser
function toPascalCase(operationId) {
  return operationId.charAt(0).toUpperCase() + operationId.slice(1)
}

// Build nested object structure from path segments.
// When a leaf (operationId string) would get children, promote to nested object. When multiple ops share a path, use action keys.
function buildNestedObject(obj, segments, operationId) {
  if (segments.length === 0) return operationId

  const [first, ...rest] = segments
  const key = toCamelCase(first)

  if (rest.length === 0) {
    const existing = obj[key]
    if (typeof existing === 'string') {
      obj[key] = { [toActionKey(existing)]: existing, [toActionKey(operationId)]: operationId }
    } else if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      obj[key][toActionKey(operationId)] = operationId
    } else {
      obj[key] = operationId
    }
    return obj
  }

  const existing = obj[key]
  if (typeof existing === 'string') {
    obj[key] = { [toActionKey(existing)]: existing }
  }
  if (!obj[key] || typeof obj[key] === 'string') {
    obj[key] = {}
  }
  buildNestedObject(obj[key], rest, operationId)
  return obj
}

// Generate TypeScript code for nested object
function generateNestedObject(obj, indent = 0) {
  const spaces = '  '.repeat(indent)
  const lines = []

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      lines.push(`${spaces}${key}: gen.${value},`)
    } else {
      lines.push(`${spaces}${key}: {`)
      lines.push(...generateNestedObject(value, indent + 1))
      lines.push(`${spaces}},`)
    }
  }

  return lines
}

// Collect all operationIds from nested structure (for import list)
function collectOperationIds(obj, acc = new Set()) {
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      acc.add(value)
    } else {
      collectOperationIds(value, acc)
    }
  }
  return acc
}

// Returns true if the operation has required parameters or requestBody
function hasRequiredInputs(operation) {
  if (!operation) return false
  const hasRequiredParam =
    Array.isArray(operation.parameters) && operation.parameters.some(p => p.required === true)
  const hasRequiredBody = operation.requestBody && operation.requestBody.required !== false
  return hasRequiredParam || hasRequiredBody
}

// operationIds that have no *Response type (hey-api uses unknown, e.g. redirect endpoints)
const NO_RESPONSE_OPERATIONS = new Set(['oauthGithubAuthorize'])

// Generate CoreApiClient type lines from nested structure
function generateClientTypeLines(obj, indent = 0) {
  const spaces = '  '.repeat(indent)
  const lines = []
  const entries = Object.entries(obj)

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i]
    const isLast = i === entries.length - 1
    const sep = isLast ? '' : ';'

    if (typeof value === 'string') {
      const opId = value
      const operation = operationIdToOperation[opId]
      const optional = !hasRequiredInputs(operation)
      const prefix = toPascalCase(opId)
      const dataType = `${prefix}Data`
      const responseType = NO_RESPONSE_OPERATIONS.has(opId) ? 'unknown' : `${prefix}Response`
      const optsPart = optional ? `opts?: Options<${dataType}>` : `opts: Options<${dataType}>`
      lines.push(`${spaces}${key}: (${optsPart}) => Promise<${responseType}>${sep}`)
    } else {
      lines.push(`${spaces}${key}: {`)
      lines.push(...generateClientTypeLines(value, indent + 1))
      lines.push(`${spaces}}${sep}`)
    }
  }

  return lines
}

// Read OpenAPI spec
const openapiSpec = JSON.parse(readFileSync(openapiPath, 'utf-8'))
const paths = openapiSpec.paths || {}
const nestedStructure = {}
/** operationId -> operation object (for required inputs detection) */
const operationIdToOperation = {}

// Process each path
for (const [path, methods] of Object.entries(paths)) {
  // Skip if methods is not an object
  if (typeof methods !== 'object' || methods === null) continue

  // Process each HTTP method
  for (const [method, operation] of Object.entries(methods)) {
    // Skip non-HTTP methods and invalid operations
    if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) continue
    if (typeof operation !== 'object' || operation === null) continue

    // Get operationId or use HTTP method name (openapi-ts default behavior)
    let operationId = operation.operationId

    // If no operationId, use HTTP method name (lowercase)
    // This matches openapi-ts behavior when operationId is missing
    if (!operationId) {
      operationId = method.toLowerCase()
    }

    operationIdToOperation[operationId] = operation

    // Parse path segments
    const pathSegments = path.split('/').filter(Boolean)

    // Handle root path
    if (path === '/') {
      nestedStructure.get = operationId
      continue
    }

    // Handle single-segment paths (e.g., /health)
    // Use operationId as the key for single-segment paths
    if (pathSegments.length === 1) {
      nestedStructure[operationId] = operationId
      continue
    }

    // Build nested structure for multi-segment paths
    buildNestedObject(nestedStructure, pathSegments, operationId)
  }
}

// Generate TypeScript code
const nestedObjectLines = generateNestedObject(nestedStructure)
const output = `// This file is auto-generated. Do not edit manually.

import * as gen from './gen/index'

export const api = {
${nestedObjectLines.join('\n')}
}
`

// Write generated file
writeFileSync(outputPath, output, 'utf-8')
logger.info('✅ Generated api-wrapper.gen.ts')

// Generate api-client.gen.ts with CoreApiClient type
const operationIds = [...collectOperationIds(nestedStructure)].sort()
const typeImports = operationIds.flatMap(opId => {
  const prefix = toPascalCase(opId)
  const types = [`${prefix}Data`]
  if (!NO_RESPONSE_OPERATIONS.has(opId)) types.push(`${prefix}Response`)
  return types
})
const uniqueTypeImports = [...new Set(typeImports)].sort()
const clientTypeLines = generateClientTypeLines(nestedStructure, 1)

const apiClientOutput = `// This file is auto-generated. Do not edit manually.

import type { Options } from './gen/index'
import type {
  ${uniqueTypeImports.join(',\n  ')},
} from './gen/types.gen'

export type CoreApiClient = {
${clientTypeLines.join('\n')}
}
`

writeFileSync(apiClientOutputPath, apiClientOutput, 'utf-8')
logger.info('✅ Generated api-client.gen.ts')
