import { defineTool } from 'eve/tools'
import { z } from 'zod'
import { userIdFromCtx } from '#lib/principal.js'
import { composeOwnWallet } from '#lib/wallet.js'

export default defineTool({
  description: "Live tokens for the caller's linked Ethereum wallet. No user id.",
  inputSchema: z.object({}),
  execute: (_input, ctx) =>
    composeOwnWallet({ userId: userIdFromCtx({ ctx }) }).then(wallet => ({
      address: wallet.address,
      tokens: wallet.tokens,
      error: wallet.error,
    })),
})
