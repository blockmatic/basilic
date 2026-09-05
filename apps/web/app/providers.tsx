'use client'

import { createClient } from '@repo/core'
import { ApiProvider } from '@repo/react'
import { Toaster } from '@repo/ui/components/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getAuthToken, getRefreshToken, refreshSessionViaNext } from 'lib/auth/auth-client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode, useState } from 'react'
import { env } from '@/lib/env'

export const coreClient = createClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getAuthToken,
  getRefreshToken,
  refreshTokens: refreshSessionViaNext,
  onTokensRefreshed: async () => {},
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider client={coreClient}>
        <NuqsAdapter>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            {children}
            <Toaster richColors position="top-right" />
          </NextThemesProvider>
        </NuqsAdapter>
      </ApiProvider>
    </QueryClientProvider>
  )
}
