import { unwatchAsset } from '@repo/db'
import { defineTool } from 'eve/tools'
import { z } from 'zod'
import { userIdFromCtx } from '#lib/principal.js'

export default defineTool({
  description: "Remove an asset from the caller's watches. userId is not a tool argument.",
  inputSchema: z.object({ assetId: z.string().min(1) }),
  execute: ({ assetId }, ctx) => unwatchAsset({ userId: userIdFromCtx({ ctx }), assetId }),
})
