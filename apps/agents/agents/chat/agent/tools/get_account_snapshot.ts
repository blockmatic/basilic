import { getAccountSnapshot } from '@repo/db'
import { defineTool } from 'eve/tools'
import { z } from 'zod'
import { userIdFromCtx } from '#lib/principal.js'

export default defineTool({
  description: "Return this caller's profile. Read-only. No wallet balances.",
  inputSchema: z.object({}),
  execute: (_input, ctx) => getAccountSnapshot({ userId: userIdFromCtx({ ctx }) }),
})
