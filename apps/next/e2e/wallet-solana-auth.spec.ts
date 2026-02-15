import { testWithSynpress } from '@synthetixio/synpress'
import { Phantom, phantomFixtures } from '@synthetixio/synpress/playwright'
import phantomSetup from './wallet-setup/phantom.setup'

const test = testWithSynpress(phantomFixtures(phantomSetup))
const { expect } = test

test('Solana wallet login flow', async ({ page, context, phantomPage, extensionId }) => {
  const phantom = new Phantom(context, phantomPage, phantomSetup.walletPassword, extensionId)

  await page.goto('/login')
  await page.getByRole('button', { name: /wallet login/i }).click()
  await page.getByRole('button', { name: /connect solana wallet/i }).click()
  await phantom.connectToDapp()
  await page.getByRole('button', { name: /sign in with solana/i }).click()
  await phantom.confirmSignature()
  await expect(page).toHaveURL(/\/(\?.*)?$/)
})
