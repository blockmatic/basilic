import { getAsset } from '@repo/markets'
import { defineTool } from 'eve/tools'
import { z } from 'zod'

export default defineTool({
  description: 'Get a public asset detail. No user id.',
  inputSchema: z.object({ assetId: z.string().min(1) }),
  execute: input => getAsset(input),
})
