import { parseViewConfig, type ViewConfig } from '@/lib/genui'

export function viewConfigFromEvents({
  events,
}: {
  events: readonly { type: string; data?: unknown }[]
}) {
  for (const event of events) {
    if (event.type !== 'action.result' || typeof event.data !== 'object' || event.data === null)
      continue
    const result = (event.data as { result?: unknown }).result
    const rows = Array.isArray(result) ? result : [result]
    for (const row of rows) {
      if (typeof row !== 'object' || row === null) continue
      const record = row as { toolName?: unknown; output?: unknown; isError?: unknown }
      if (record.toolName !== 'set_view' || record.isError) continue
      const output = record.output
      if (typeof output !== 'object' || output === null) continue
      const viewConfig = parseViewConfig({
        value: 'viewConfig' in output ? (output as { viewConfig: unknown }).viewConfig : output,
      })
      if (!viewConfig) continue
      const honesty =
        'honesty' in output && typeof (output as { honesty?: unknown }).honesty === 'string'
          ? (output as { honesty: string }).honesty
          : undefined
      return { viewConfig, honesty }
    }
  }
  return null
}

export type CommandTurnView = { viewConfig: ViewConfig; honesty?: string }
