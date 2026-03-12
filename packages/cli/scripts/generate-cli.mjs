import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptFile = fileURLToPath(import.meta.url)
const scriptDir = dirname(scriptFile)
const openapiPath = join(scriptDir, '../../../apps/api/openapi/openapi.json')
const outputDir = join(scriptDir, '../src/gen')
const outputPath = join(outputDir, 'commands.gen.ts')

// Convert string to camelCase; strip {...} from path params for valid keys
function toCamelCase(str) {
  const cleaned = str.replace(/^\{|\}$/g, '')
  return cleaned.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// camelCase to kebab-case for CLI
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

// Extract action key from operationId (e.g. accountApikeysCreate -> create)
function toActionKey(operationId) {
  const match = operationId.match(/[A-Z][a-z]+$/)
  return match ? match[0].toLowerCase() : operationId
}

// Build nested object structure from path segments (same as core generate-wrapper)
function buildNestedObject(obj, segments, operationId) {
  if (segments.length === 0) return operationId

  const [first, ...rest] = segments
  const key = toCamelCase(first)

  if (rest.length === 0) {
    const existing = obj[key]
    if (typeof existing === 'string')
      obj[key] = { [toActionKey(existing)]: existing, [toActionKey(operationId)]: operationId }
    else if (existing && typeof existing === 'object' && !Array.isArray(existing))
      obj[key][toActionKey(operationId)] = operationId
    else obj[key] = operationId

    return obj
  }

  const existing = obj[key]
  if (typeof existing === 'string') obj[key] = { [toActionKey(existing)]: existing }

  if (!obj[key] || typeof obj[key] === 'string') obj[key] = {}

  buildNestedObject(obj[key], rest, operationId)
  return obj
}

// Traverse nested structure and collect { path, operationId } for each leaf
function collectCommandSpecs(obj, pathPrefix = [], acc = []) {
  for (const [key, value] of Object.entries(obj)) {
    const path = [...pathPrefix, key]
    if (typeof value === 'string') acc.push({ path, operationId: value })
    else collectCommandSpecs(value, path, acc)
  }
  return acc
}

// Extract path and body params from OpenAPI operation
function getParams(operation) {
  const pathParams = []
  const bodyParams = []
  const params = operation.parameters ?? []
  for (const p of params) if (p.in === 'path' && p.name) pathParams.push({ name: p.name })

  const body = operation.requestBody?.content?.['application/json']?.schema
  if (body?.properties) for (const name of Object.keys(body.properties)) bodyParams.push({ name })

  return { pathParams, bodyParams }
}

// Read OpenAPI spec
const openapiSpec = JSON.parse(readFileSync(openapiPath, 'utf-8'))
const paths = openapiSpec.paths || {}
const nestedStructure = {}

for (const [path, methods] of Object.entries(paths)) {
  if (path.startsWith('/auth')) continue
  if (typeof methods !== 'object' || methods === null) continue

  for (const [method, operation] of Object.entries(methods)) {
    if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) continue
    if (typeof operation !== 'object' || operation === null) continue

    let operationId = operation.operationId
    if (!operationId) operationId = method.toLowerCase()

    const pathSegments = path.split('/').filter(Boolean)
    if (path === '/') continue

    if (pathSegments.length === 1) {
      nestedStructure[operationId] = operationId
      continue
    }

    buildNestedObject(nestedStructure, pathSegments, operationId)
  }
}

const rawSpecs = collectCommandSpecs(nestedStructure)
const operationMeta = {}
const commandSpecs = []

for (const { path, operationId } of rawSpecs) {
  let op
  for (const [p, methods] of Object.entries(paths)) {
    if (p.startsWith('/auth')) continue
    for (const [, operation] of Object.entries(methods ?? {}))
      if (operation?.operationId === operationId) {
        op = operation
        break
      }
  }
  const { pathParams, bodyParams } = op ? getParams(op) : { pathParams: [], bodyParams: [] }
  const summary = op?.summary ?? operationId
  const description = op?.description ?? summary

  operationMeta[operationId] = { summary, description, pathParams, bodyParams }
  const cliPath = path.map(s => (s.includes('-') ? s : toKebabCase(s)))
  commandSpecs.push({ path: cliPath, operationId })
}

const output = `// This file is auto-generated. Do not edit manually.

export const operationMeta = ${JSON.stringify(operationMeta, null, 2)} as const

export const commandSpecs = ${JSON.stringify(commandSpecs, null, 2)} as const
`

mkdirSync(outputDir, { recursive: true })
writeFileSync(outputPath, output, 'utf-8')
