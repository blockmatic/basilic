import { listWatches } from '@repo/db'
import { defineTool } from 'eve/tools'
import { z } from 'zod'
import { userIdFromCtx } from '#lib/principal.js'

export default defineTool({
  description: "List the caller's own coin watches.",
  inputSchema: z.object({}),
  execute: (_input, ctx) => listWatches({ userId: userIdFromCtx({ ctx }) }),
})
