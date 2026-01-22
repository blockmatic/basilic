// Web3 authentication plugin for Better Auth
// This is a placeholder implementation - full SIWE/SIWS verification to be implemented
// Based on the spec in __dev/auth/better-auth.md

import type { BetterAuthPlugin } from 'better-auth'
import { createAuthEndpoint } from 'better-auth/api'
import { env } from '../env.js'

export const web3Plugin = (): BetterAuthPlugin => ({
  id: 'web3',
  endpoints: {
    getNonce: createAuthEndpoint(
      '/sign-in/web3/:chain/nonce',
      {
        method: 'GET',
      },
      async ctx => {
        const { chain } = ctx.params as { chain: string }
        const normalizedChain = chain.toLowerCase()

        if (normalizedChain !== 'eip155' && normalizedChain !== 'solana') {
          return ctx.json(
            { error: `Invalid chain: ${chain}. Supported chains are 'eip155' and 'solana'.` },
            { status: 400 },
          )
        }

        const nonce = crypto.randomUUID()

        // TODO: Store nonce in database or cache with TTL (5 minutes)
        // For now, return nonce directly

        return ctx.json({
          nonce,
          domain:
            ctx.request?.headers.get('host') || ctx.headers?.get('host') || `localhost:${env.PORT}`,
          issuedAt: new Date().toISOString(),
          expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          chain: normalizedChain,
        })
      },
    ),
    verifyWeb3: createAuthEndpoint(
      '/sign-in/web3/:chain/verify',
      {
        method: 'POST',
      },
      async ctx => {
        // TODO: Implement SIWE/SIWS signature verification
        // TODO: Verify nonce freshness
        // TODO: Find or create user
        // TODO: Create session
        // Parameters: chain from ctx.params, message/signature/address from ctx.body
        void ctx

        return ctx.json({ error: 'Web3 authentication not yet fully implemented' }, { status: 501 })
      },
    ),
  },
})
