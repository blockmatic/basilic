import type { Spec } from "@json-render/core";

import {
  isBoardRecipeId,
  isChartRecipeId,
  isOverviewRecipeId,
  isTableRecipeId,
  recipeSpecElement,
} from "./candidates";
import type { BoardRecipeId } from "./candidates";
import { composeSurface, resolveChartRecipeId } from "./compose";
import { parseViewConfig } from "./view-config";
import type { ViewConfig } from "./view-config";

function uniqueRecipeIds({ ids }: { ids: string[] }): BoardRecipeId[] {
  const seen = new Set<string>();
  const next: BoardRecipeId[] = [];
  for (const id of ids) {
    if (!isBoardRecipeId(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    next.push(id);
  }
  return next;
}

function withChartRecipe({
  ids,
  view,
}: {
  ids: BoardRecipeId[];
  view: ViewConfig;
}): BoardRecipeId[] {
  if (view.surface !== "chart" || ids.some((id) => isChartRecipeId(id))) {
    return ids;
  }
  const chartId = resolveChartRecipeId({ view });
  const summaryIndex = ids.indexOf("summary");
  if (summaryIndex !== -1) {
    return [
      ...ids.slice(0, summaryIndex + 1),
      chartId,
      ...ids.slice(summaryIndex + 1),
    ];
  }
  return [chartId, ...ids];
}

export function specFromSelection({
  elements,
  view,
}: {
  elements: string[];
  view: ViewConfig;
}): Spec {
  const parsed = parseViewConfig({ value: view }) ?? view;
  const childIds = withChartRecipe({
    ids: uniqueRecipeIds({ ids: elements }),
    view: parsed,
  });
  if (
    !childIds.some(
      (id) =>
        isTableRecipeId(id) || isChartRecipeId(id) || isOverviewRecipeId(id)
    )
  ) {
    return composeSurface({ view: parsed });
  }

  return {
    elements: {
      board: {
        children: childIds,
        props: { direction: "vertical", gap: "md" },
        type: "Stack",
      },
      ...Object.fromEntries(
        childIds.map((id) => [id, recipeSpecElement({ id, view: parsed })])
      ),
    },
    root: "board",
  };
}
