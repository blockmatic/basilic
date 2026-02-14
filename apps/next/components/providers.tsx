'use client'

import { createClient } from '@repo/core'
import { ReactApiProvider } from '@repo/react'
import { logger } from '@repo/utils/logger'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import { env } from '@/lib/env'
import { wagmiConfig } from '@/lib/wagmi-config'
import '@solana/wallet-adapter-react-ui/styles.css'

// Create clients at module level (singleton pattern)
const queryClient = new QueryClient()

async function getAuthToken() {
  const response = await fetch('/api/auth/get-session', { credentials: 'include' })
  if (!response.ok) return null
  const data = await response.json()
  return data.token ?? null
}

logger.info('env.NEXT_PUBLIC_API_URL', env.NEXT_PUBLIC_API_URL)

const coreClient = createClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getAuthToken,
  getRefreshToken: async () => {
    const response = await fetch('/api/auth/get-session', { credentials: 'include' })
    if (!response.ok) return null
    const data = await response.json()
    return data.refreshToken ?? null
  },
  onTokensRefreshed: async ({ token, refreshToken }) => {
    await fetch('/api/auth/update-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, refreshToken }),
      credentials: 'include',
    })
  },
})

export function Providers({ children }: { children: ReactNode }) {
  const solanaEndpoint = useMemo(() => clusterApiUrl(WalletAdapterNetwork.Mainnet), [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <ConnectionProvider endpoint={solanaEndpoint}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <QueryClientProvider client={queryClient}>
              <ReactApiProvider
                client={coreClient}
                baseUrl={env.NEXT_PUBLIC_API_URL}
                getAuthToken={getAuthToken}
                authCallbackUrl="/api/auth/callback"
              >
                <NuqsAdapter>
                  <NextThemesProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                    enableColorScheme
                  >
                    {children}
                  </NextThemesProvider>
                </NuqsAdapter>
              </ReactApiProvider>
            </QueryClientProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </WagmiProvider>
  )
}
