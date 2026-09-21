import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors/injected'
import { walletConnect } from 'wagmi/connectors/walletConnect'
import { env } from '@/lib/env'

const walletConnectProjectId = env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected({ shimDisconnect: true }),
    ...(walletConnectProjectId
      ? [
          walletConnect({
            projectId: walletConnectProjectId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: { [mainnet.id]: http() },
  ssr: true,
})

export const hasWalletConnectProjectId = Boolean(walletConnectProjectId)
