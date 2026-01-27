import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '@repo/utils/logger'

const scriptFile = fileURLToPath(import.meta.url)
const scriptDir = dirname(scriptFile)
const openapiPath = join(scriptDir, '../../../apps/fastify/openapi/openapi.json')
const outputPath = join(scriptDir, '../src/api-wrapper.gen.ts')

// Convert string to camelCase
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Build nested object structure from path segments
function buildNestedObject(obj, segments, operationId) {
  if (segments.length === 0) {
    return operationId
  }

  const [first, ...rest] = segments
  const key = toCamelCase(first)

  if (!obj[key]) {
    obj[key] = {}
  }

  if (rest.length === 0) {
    obj[key] = operationId
  } else {
    obj[key] = buildNestedObject(obj[key], rest, operationId)
  }

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

// Read OpenAPI spec
const openapiSpec = JSON.parse(readFileSync(openapiPath, 'utf-8'))
const paths = openapiSpec.paths || {}
const nestedStructure = {}

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
