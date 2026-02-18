import { installMockWallet } from '@johanneskares/wallet-mock'
import { test as base } from '@playwright/test'
import { http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

/** Hardhat/default test account private key for mnemonic "test test... junk" */
const TEST_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const

export const test = base.extend({
  page: async ({ page }, use) => {
    await installMockWallet({
      page,
      account: privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`),
      defaultChain: mainnet,
      transports: { [mainnet.id]: http() },
    })
    await use(page)
  },
})

export { expect } from '@playwright/test'
