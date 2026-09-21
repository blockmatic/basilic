import { getMarkets } from '@repo/markets'
import { defineTool } from 'eve/tools'
import { z } from 'zod'

export default defineTool({
  description: 'List public market rows. No user id.',
  inputSchema: z.object({
    vs: z.string().optional(),
    topN: z.number().int().positive().optional(),
    category: z.string().optional(),
    ids: z.array(z.string()).optional(),
    sparkline: z.boolean().optional(),
  }),
  execute: input => getMarkets(input),
})
