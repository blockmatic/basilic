import { getGlobal } from '@repo/markets'
import { defineTool } from 'eve/tools'
import { z } from 'zod'

export default defineTool({
  description: 'Get public global market stats. No user id.',
  inputSchema: z.object({}),
  execute: () => getGlobal(),
})
