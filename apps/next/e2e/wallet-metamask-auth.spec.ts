import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import metamaskSetup from './wallet-setup/metamask.setup'

const test = testWithSynpress(metaMaskFixtures(metamaskSetup))
const { expect } = test

test('MetaMask wallet login flow', async ({ page, context, metamaskPage, extensionId }) => {
  const metamask = new MetaMask(context, metamaskPage, metamaskSetup.walletPassword, extensionId)

  await page.goto('/login')
  await page.getByRole('button', { name: /wallet login/i }).click()
  await page.getByRole('button', { name: /connect metamask/i }).click()
  await metamask.connectToDapp()
  await page.getByRole('button', { name: /sign in with ethereum/i }).click()
  await metamask.confirmSignature()
  await expect(page).toHaveURL(/\/(\?.*)?$/)
})
