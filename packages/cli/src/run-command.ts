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
    if (v !== undefined && v !== '')
      if (p.name === 'messages' && typeof v === 'string')
        try {
          bodyParams[p.name] = JSON.parse(v) as unknown
        } catch {
          bodyParams[p.name] = [{ role: 'user', content: v }]
        }
      else if (p.name === 'stream' && (v === 'true' || v === '1')) bodyParams[p.name] = true
      else if ((p.name === 'temperature' || p.name === 'model') && v)
        bodyParams[p.name] = p.name === 'temperature' ? Number.parseFloat(v) : v
      else if (p.name === 'tools' && typeof v === 'string')
        try {
          bodyParams[p.name] = JSON.parse(v) as unknown
        } catch {
          bodyParams[p.name] = undefined
        }
      else bodyParams[p.name] = v
  }

  const callOpts: Record<string, unknown> = {}
  if (Object.keys(pathParams).length > 0) callOpts.path = pathParams
  if (Object.keys(bodyParams).length > 0) callOpts.body = bodyParams
  return fn(callOpts)
}
