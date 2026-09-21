import { z } from 'zod'
import {
  defaultSearchQuery,
  parseViewConfig,
  type ViewConfig,
  viewFromSearchQuery,
} from './view-config'

export const whoamiCommand = 'Who am I?'
export const commandHistoryKey = 'basilic.board.commands'

export type CommandHistoryEntry = {
  command: string
  viewConfig: ViewConfig
}

const historyEntrySchema = z.object({
  command: z.string().min(1),
  viewConfig: z.unknown(),
})

export function whoamiViewConfig(): ViewConfig {
  return viewFromSearchQuery({
    query: { ...defaultSearchQuery, universe: 'watchlist' },
    title: 'Your profile',
    surface: 'account',
  })
}

export function parseCommandHistory({ value }: { value: string }): CommandHistoryEntry[] {
  try {
    const parsed = z.array(historyEntrySchema).safeParse(JSON.parse(value))
    if (!parsed.success) return []
    return parsed.data.flatMap(entry => {
      const viewConfig = parseViewConfig({ value: entry.viewConfig })
      if (!viewConfig) return []
      return [{ command: entry.command, viewConfig }]
    })
  } catch {
    return []
  }
}

export function viewConfigToSearchPatch({ viewConfig }: { viewConfig: ViewConfig }) {
  return {
    surface: viewConfig.surface,
    period: viewConfig.period ?? null,
    columns: viewConfig.columns ?? null,
    ...viewConfig.query,
  }
}
