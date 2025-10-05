'use client'
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
  type Theme as RainbowKitTheme,
} from '@rainbow-me/rainbowkit'
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth'
import { SessionProvider } from 'next-auth/react'
import { webConfig } from '@/config'
import '@rainbow-me/rainbowkit/styles.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { merge } from 'lodash'
import { ThemeProvider } from 'next-themes'
import { http } from 'viem'
import { WagmiProvider } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'

const queryClient = new QueryClient()

const getSiweMessageOptions = () => ({
  statement: 'Sign in to BasilicEVM',
})

const config = getDefaultConfig({
  appName: 'BasilicEVM',
  projectId: webConfig.services.walletconnect.projectId,
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(webConfig.services.rpc.arbitrumSepolia),
  },
})

const customRainbowKitTheme: RainbowKitTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#27292B',
    accentColorForeground: '#fff',
    connectButtonBackground: '#27292B',
    connectButtonText: '#FFFFFF',
  },
  radii: {
    actionButton: '9999px',
    connectButton: '9999px',
  },
})

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <RainbowKitSiweNextAuthProvider
              getSiweMessageOptions={getSiweMessageOptions}
            >
              <RainbowKitProvider
                theme={customRainbowKitTheme}
                modalSize="compact"
                showRecentTransactions={true}
                appInfo={{ appName: 'BasilicEVM' }}
              >
                {children}
              </RainbowKitProvider>
            </RainbowKitSiweNextAuthProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

// 5. Types & Interfaces
interface ProvidersProps {
  children: React.ReactNode
}
