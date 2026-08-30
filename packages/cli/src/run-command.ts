import type { CoreApiClient } from '@repo/core'
import type { commandSpecs, operationMeta } from './gen/commands.gen'

type CommandSpec = (typeof commandSpecs)[number]
type OperationMeta = (typeof operationMeta)[keyof typeof operationMeta]

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => (letter as string).toUpperCase())
}

function getNested(
  client: object,
  path: readonly string[],
): ((opts: object) => Promise<unknown>) | undefined {
  let obj: unknown = client
  for (const segment of path) {
    if (obj === null || obj === undefined || typeof obj !== 'object') return undefined
    const key = segment.includes('-') ? toCamelCase(segment) : segment
    obj = (obj as Record<string, unknown>)[key]
  }
  return typeof obj === 'function' ? (obj as (opts: object) => Promise<unknown>) : undefined
}

function buildClientPath(spec: CommandSpec): string[] {
  return spec.path.map(seg => (seg.includes('-') ? toCamelCase(seg) : seg))
}

function parseBodyValue({ name, value }: { name: string; value: string }): unknown {
  if (name === 'messages')
    try {
      return JSON.parse(value) as unknown
    } catch {
      return [{ role: 'user', content: value }]
    }

  if (name === 'stream') {
    if (value === 'true' || value === '1') return true
    if (value === 'false' || value === '0') return false
    throw new Error(`Invalid --stream value: ${value}. Use true, 1, false, or 0`)
  }

  if (name === 'temperature') {
    const n = Number.parseFloat(value)
    if (!Number.isFinite(n))
      throw new Error(`Invalid --temperature value: ${value}. Must be a finite number`)
    return n
  }

  if (name === 'tools')
    try {
      return JSON.parse(value) as unknown
    } catch {
      throw new Error(`Invalid --tools JSON: ${value}`)
    }

  return value
}

export async function runCommand({
  client,
  spec,
  meta,
  opts,
}: {
  client: CoreApiClient
  spec: CommandSpec
  meta: OperationMeta
  opts: Record<string, string | undefined>
}): Promise<unknown> {
  const clientPath = buildClientPath(spec)
  const fn = getNested(client, clientPath)
  if (!fn) throw new Error(`Command not found: ${spec.path.join(' ')}`)

  const pathParams: Record<string, string> = {}
  for (const p of meta.pathParams) {
    const v = opts[p.name]
    if (v) pathParams[p.name] = v
  }
  const bodyParams: Record<string, unknown> = {}
  for (const p of meta.bodyParams) {
    const v = opts[p.name]
    if (v !== undefined && v !== '') bodyParams[p.name] = parseBodyValue({ name: p.name, value: v })
  }

  const callOpts: Record<string, unknown> = {}
  if (Object.keys(pathParams).length > 0) callOpts.path = pathParams
  if (Object.keys(bodyParams).length > 0) callOpts.body = bodyParams
  return fn(callOpts)
}
