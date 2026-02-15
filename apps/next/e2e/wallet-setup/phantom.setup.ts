import { defineWalletSetup } from '@synthetixio/synpress'
import { getExtensionIdPhantom, Phantom } from '@synthetixio/synpress/playwright'

const SEED_PHRASE = 'test test test test test test test test test test test junk'
const PASSWORD = 'Tester@1234'

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const extensionId = await getExtensionIdPhantom(context, 'Phantom')
  const phantom = new Phantom(context, walletPage, PASSWORD, extensionId)
  await phantom.importWallet(SEED_PHRASE)
})
