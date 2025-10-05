'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { ThirdwebProvider } from 'thirdweb/react'
import { http } from 'viem'
import { createConfig, WagmiProvider } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { webConfig } from '@/config'

const queryClient = new QueryClient()

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(webConfig.services.rpc.arbitrumSepolia),
  },
})

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <ThirdwebProvider>{children}</ThirdwebProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

// 5. Types & Interfaces
interface ProvidersProps {
  children: React.ReactNode
}
