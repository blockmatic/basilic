import { watchAsset } from '@repo/db'
import { defineTool } from 'eve/tools'
import { z } from 'zod'
import { userIdFromCtx } from '#lib/principal.js'

export default defineTool({
  description: 'Watch an asset for the caller. userId is not a tool argument.',
  inputSchema: z.object({ assetId: z.string().min(1) }),
  execute: ({ assetId }, ctx) => watchAsset({ userId: userIdFromCtx({ ctx }), assetId }),
})
