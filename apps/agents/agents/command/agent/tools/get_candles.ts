import { getCandles } from '@repo/markets'
import { defineTool } from 'eve/tools'
import { z } from 'zod'

export default defineTool({
  description: 'Get public candles. No user id.',
  inputSchema: z.object({
    assetId: z.string().min(1),
    interval: z.string().optional(),
    range: z.string().optional(),
  }),
  execute: input => getCandles(input),
})
