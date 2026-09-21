import { defineTool } from 'eve/tools'
import { z } from 'zod'
import { userIdFromCtx } from '#lib/principal.js'
import { composeOwnWallet } from '#lib/wallet.js'

export default defineTool({
  description: "Live NFTs for the caller's linked Ethereum wallet. No user id.",
  inputSchema: z.object({}),
  execute: (_input, ctx) =>
    composeOwnWallet({ userId: userIdFromCtx({ ctx }) }).then(wallet => ({
      address: wallet.address,
      nfts: wallet.nfts,
      error: wallet.error,
    })),
})
