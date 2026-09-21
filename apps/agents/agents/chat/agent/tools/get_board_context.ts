import { defineTool } from 'eve/tools'
import { z } from 'zod'

export default defineTool({
  description:
    "Return the client's current board canvas (query, view, selected GenUI elements). Not tenant identity.",
  inputSchema: z.object({
    boardQuery: z.unknown().optional(),
    viewConfig: z.record(z.string(), z.unknown()).optional(),
    elements: z.array(z.string()).optional(),
  }),
  execute: input => ({
    boardQuery: input.boardQuery ?? null,
    viewConfig: input.viewConfig ?? null,
    elements: input.elements ?? [],
  }),
})
