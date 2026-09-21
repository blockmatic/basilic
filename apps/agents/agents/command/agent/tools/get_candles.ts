import { findBinanceMarket } from '@repo/db'
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
  execute: async input => {
    const { market } = await findBinanceMarket({ assetId: input.assetId })
    return getCandles({
      ...input,
      mapping: market ? { binanceSymbol: market.symbol } : undefined,
    })
  },
})
