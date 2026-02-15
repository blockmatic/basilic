import { defineWalletSetup } from '@synthetixio/synpress'
import { getExtensionId, MetaMask } from '@synthetixio/synpress/playwright'

const SEED_PHRASE = 'test test test test test test test test test test test junk'
const PASSWORD = 'Tester@1234'

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const extensionId = await getExtensionId(context, 'MetaMask')
  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId)
  await metamask.importWallet(SEED_PHRASE)
})
