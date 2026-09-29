import isEqual from "lodash-es/isEqual";
import { z } from "zod";

import { splitBoardView } from "./surface";
import type { BoardViewState } from "./surface";
import {
  defaultSearchQuery,
  parseViewConfig,
  viewFromSearchQuery,
} from "./view-config";
import type { ViewConfig } from "./view-config";

export const whoamiCommand = "Who am I?";
export const commandHistoryKey = "basilic.board.commands";

export interface CommandHistoryEntry {
  command: string;
  viewConfig: ViewConfig;
  eveTurnId?: string;
}

const historyEntrySchema = z.object({
  command: z.string().min(1),
  eveTurnId: z.string().optional(),
  viewConfig: z.unknown(),
});

export function whoamiViewConfig(): ViewConfig {
  return viewFromSearchQuery({
    query: { ...defaultSearchQuery, universe: "watchlist" },
    surface: "account",
    title: "Your profile",
  });
}

export function parseCommandHistory({
  value,
}: {
  value: string;
}): CommandHistoryEntry[] {
  try {
    const parsed = z.array(historyEntrySchema).safeParse(JSON.parse(value));
    if (!parsed.success) {
      return [];
    }
    return parsed.data.flatMap((entry) => {
      const viewConfig = parseViewConfig({ value: entry.viewConfig });
      if (!viewConfig) {
        return [];
      }
      return [
        { command: entry.command, eveTurnId: entry.eveTurnId, viewConfig },
      ];
    });
  } catch {
    return [];
  }
}

export function viewConfigToSearchPatch({
  viewConfig,
}: {
  viewConfig: ViewConfig;
}) {
  return {
    chart: viewConfig.chart ?? null,
    columns: viewConfig.columns ?? null,
    elements: viewConfig.elements ?? null,
    focus: null,
    period: viewConfig.period ?? null,
    surface: viewConfig.surface,
    ...viewConfig.query,
  };
}

export function isActiveCommandHistoryEntry({
  entry,
  q,
  view,
}: {
  entry: CommandHistoryEntry;
  q: string | null;
  view: BoardViewState;
}): boolean {
  if (!q || entry.command !== q) {
    return false;
  }
  const split = splitBoardView({ view });
  return isEqual(
    viewConfigToSearchPatch({
      viewConfig: viewFromSearchQuery({
        chart: split.chart,
        columns: split.columns,
        elements: split.elements,
        period: split.period,
        query: split.query,
        surface: split.surface,
        title: entry.viewConfig.title,
      }),
    }),
    viewConfigToSearchPatch({ viewConfig: entry.viewConfig })
  );
}
