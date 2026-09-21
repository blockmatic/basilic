import { searchAssets } from '@repo/markets'
import { defineTool } from 'eve/tools'
import { z } from 'zod'

export default defineTool({
  description: 'Search public assets by text. No user id.',
  inputSchema: z.object({ text: z.string().min(1) }),
  execute: input => searchAssets(input),
})
